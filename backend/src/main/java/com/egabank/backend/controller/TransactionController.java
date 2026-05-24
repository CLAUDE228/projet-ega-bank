package com.egabank.backend.controller;

import com.egabank.backend.dto.TransactionResponse;
import com.egabank.backend.entity.BankTransaction;
import com.egabank.backend.repository.TransactionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<TransactionResponse>> listAll(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        List<BankTransaction> all = transactionRepository.findAll();
        LocalDateTime from = start == null ? LocalDate.of(1970,1,1).atStartOfDay() : start.atStartOfDay();
        LocalDateTime to = end == null ? LocalDateTime.now() : end.atTime(LocalTime.MAX);

        List<TransactionResponse> result = all.stream()
                .filter(tx -> !tx.getTransactionDate().isBefore(from) && !tx.getTransactionDate().isAfter(to))
                .filter(tx -> accountId == null || tx.getAccount().getId().equals(accountId))
                .map(tx -> new TransactionResponse(
                        tx.getId(),
                        tx.getType(),
                        tx.getAmount(),
                        tx.getTransactionDate(),
                        tx.getDescription(),
                        tx.getRelatedAccountNumber()
                ))
                .sorted((a,b) -> b.transactionDate().compareTo(a.transactionDate()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
