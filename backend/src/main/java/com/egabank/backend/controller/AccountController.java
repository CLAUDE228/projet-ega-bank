package com.egabank.backend.controller;

import com.egabank.backend.dto.AccountRequest;
import com.egabank.backend.dto.AccountResponse;
import com.egabank.backend.dto.TransactionRequest;
import com.egabank.backend.dto.TransactionResponse;
import com.egabank.backend.dto.TransferRequest;
import com.egabank.backend.service.AccountService;
import com.egabank.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import java.util.Optional;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final UserRepository userRepository;

    public AccountController(AccountService accountService, UserRepository userRepository) {
        this.accountService = accountService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AccountResponse>> findAll() {
        return ResponseEntity.ok(accountService.findAll());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<List<AccountResponse>> myAccounts() {
        Long clientId = getCurrentUserClientId();
        if (clientId == null) return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(accountService.findByOwner(clientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<AccountResponse> findById(@PathVariable Long id) {
        if (!isAuthorizedForAccount(id)) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(accountService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody AccountRequest request) {
        // if user, ensure they create account only for their own client
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isUser = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
        if (isUser) {
            Long clientId = getCurrentUserClientId();
            if (clientId == null || !clientId.equals(request.ownerId())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AccountResponse> update(@PathVariable Long id, @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.ok(accountService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-number/{number}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<AccountResponse> findByNumber(@PathVariable("number") String number) {
        AccountResponse acc = accountService.findByAccountNumber(number);
        // ensure caller is allowed to view
        if (!isAuthorizedForAccount(acc.id())) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(acc);
    }

    @PostMapping("/{id}/deposit")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<AccountResponse> deposit(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        if (!isAuthorizedForAccount(id)) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(accountService.deposit(id, request));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<AccountResponse> withdraw(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        if (!isAuthorizedForAccount(id)) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(accountService.withdraw(id, request));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<Void> transfer(@Valid @RequestBody TransferRequest request) {
        // if user, ensure they are owner of source account
        Long clientId = getCurrentUserClientId();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isUser = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
        if (isUser) {
            // check source account
            java.util.List<AccountResponse> owned = accountService.findByOwner(clientId);
            boolean owns = owned.stream().anyMatch(a -> a.id().equals(request.sourceAccountId()));
            if (!owns) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        accountService.transfer(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionResponse>> transactions(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        // only admin or owner can view
        if (!isAuthorizedForAccount(id)) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(accountService.getTransactions(id, start, end));
    }

    @GetMapping("/{id}/statement")
    public ResponseEntity<byte[]> statement(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        if (!isAuthorizedForAccount(id)) return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        byte[] pdf = accountService.generateStatement(id, start, end);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("releve-compte-" + id + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    private Long getCurrentUserClientId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<com.egabank.backend.entity.AppUser> user = userRepository.findByUsername(username);
        return user.filter(u -> u.getClient() != null).map(u -> u.getClient().getId()).orElse(null);
    }

    private boolean isAuthorizedForAccount(Long accountId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return true;
        Long clientId = getCurrentUserClientId();
        if (clientId == null) return false;
        AccountResponse acc = accountService.findById(accountId);
        return acc.ownerId().equals(clientId);
    }
}
