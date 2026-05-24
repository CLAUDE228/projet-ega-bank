package com.egabank.backend.service;

import com.egabank.backend.dto.AccountRequest;
import com.egabank.backend.dto.AccountResponse;
import com.egabank.backend.dto.TransactionRequest;
import com.egabank.backend.dto.TransactionResponse;
import com.egabank.backend.dto.TransferRequest;
import com.egabank.backend.entity.Account;
import com.egabank.backend.entity.BankTransaction;
import com.egabank.backend.entity.Client;
import com.egabank.backend.enums.TransactionType;
import com.egabank.backend.exception.BusinessException;
import com.egabank.backend.exception.ResourceNotFoundException;
import com.egabank.backend.repository.AccountRepository;
import com.egabank.backend.repository.TransactionRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.transaction.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ClientService clientService;
    private final IbanGeneratorService ibanGeneratorService;

    public AccountService(AccountRepository accountRepository, TransactionRepository transactionRepository,
                          ClientService clientService, IbanGeneratorService ibanGeneratorService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.clientService = clientService;
        this.ibanGeneratorService = ibanGeneratorService;
    }

    public List<AccountResponse> findAll() {
        return accountRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AccountResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public AccountResponse findByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable: " + accountNumber));
        return toResponse(account);
    }

    public java.util.List<AccountResponse> findByOwner(Long ownerId) {
        return accountRepository.findByOwnerId(ownerId).stream().map(this::toResponse).toList();
    }

    public AccountResponse create(AccountRequest request) {
        Client owner = clientService.getEntity(request.ownerId());
        Account account = new Account();
        account.setType(request.type());
        account.setOwner(owner);
        account.setCreatedAt(LocalDateTime.now());
        account.setBalance(BigDecimal.ZERO);
        account.setAccountNumber(generateUniqueAccountNumber());
        // Keep both sides of the relationship in sync
        owner.getAccounts().add(account);
        Account saved = accountRepository.save(account);
        return toResponse(saved);
    }

    public AccountResponse update(Long id, AccountRequest request) {
        Account account = getEntity(id);
        Client owner = clientService.getEntity(request.ownerId());
        account.setType(request.type());
        account.setOwner(owner);
        return toResponse(accountRepository.save(account));
    }

    public void delete(Long id) {
        accountRepository.delete(getEntity(id));
    }

    @Transactional
    public AccountResponse deposit(Long accountId, TransactionRequest request) {
        Account account = getEntity(accountId);
        account.setBalance(account.getBalance().add(request.amount()));
        saveTransaction(account, TransactionType.DEPOSIT, request.amount(), request.description(), null);
        return toResponse(account);
    }

    @Transactional
    public AccountResponse withdraw(Long accountId, TransactionRequest request) {
        Account account = getEntity(accountId);
        ensureEnoughBalance(account, request.amount());
        account.setBalance(account.getBalance().subtract(request.amount()));
        saveTransaction(account, TransactionType.WITHDRAWAL, request.amount(), request.description(), null);
        return toResponse(account);
    }

    @Transactional
    public void transfer(TransferRequest request) {
        if (request.sourceAccountId().equals(request.targetAccountId())) {
            throw new BusinessException("Le compte source et le compte cible doivent etre differents");
        }
        Account source = getEntity(request.sourceAccountId());
        Account target = getEntity(request.targetAccountId());
        ensureEnoughBalance(source, request.amount());

        source.setBalance(source.getBalance().subtract(request.amount()));
        target.setBalance(target.getBalance().add(request.amount()));

        saveTransaction(source, TransactionType.TRANSFER_OUT, request.amount(), request.description(), target.getAccountNumber());
        saveTransaction(target, TransactionType.TRANSFER_IN, request.amount(), request.description(), source.getAccountNumber());
    }

    public List<TransactionResponse> getTransactions(Long accountId, LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new BusinessException("La date de fin doit etre superieure ou egale a la date de debut");
        }
        Account account = getEntity(accountId);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        return transactionRepository.findByAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                account.getId(), start, end
        ).stream().map(this::toTransactionResponse).toList();
    }

    public byte[] generateStatement(Long accountId, LocalDate startDate, LocalDate endDate) {
        Account account = getEntity(accountId);
        List<TransactionResponse> transactions = getTransactions(accountId, startDate, endDate);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();
            document.add(new Paragraph("Releve de compte Ega Bank"));
            document.add(new Paragraph("Compte: " + account.getAccountNumber()));
            document.add(new Paragraph("Client: " + account.getOwner().getFirstName() + " " + account.getOwner().getLastName()));
            document.add(new Paragraph("Periode: " + startDate + " au " + endDate));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.addCell("Date");
            table.addCell("Type");
            table.addCell("Montant");
            table.addCell("Compte lie");
            table.addCell("Description");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            for (TransactionResponse transaction : transactions) {
                table.addCell(transaction.transactionDate().format(formatter));
                table.addCell(transaction.type().name());
                table.addCell(transaction.amount().toPlainString());
                table.addCell(transaction.relatedAccountNumber() == null ? "-" : transaction.relatedAccountNumber());
                table.addCell(transaction.description() == null ? "-" : transaction.description());
            }

            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Solde actuel: " + account.getBalance().toPlainString()));
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | IOException ex) {
            throw new BusinessException("Impossible de generer le releve: " + ex.getMessage());
        }
    }

    public Account getEntity(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable: " + id));
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getType(),
                account.getCreatedAt(),
                account.getBalance(),
                account.getOwner().getId(),
                account.getOwner().getFirstName() + " " + account.getOwner().getLastName()
        );
    }

    private TransactionResponse toTransactionResponse(BankTransaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getTransactionDate(),
                transaction.getDescription(),
                transaction.getRelatedAccountNumber()
        );
    }

    private void ensureEnoughBalance(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Solde insuffisant pour effectuer cette operation");
        }
    }

    private void saveTransaction(Account account, TransactionType type, BigDecimal amount,
                                 String description, String relatedAccountNumber) {
        BankTransaction transaction = new BankTransaction();
        transaction.setAccount(account);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transaction.setRelatedAccountNumber(relatedAccountNumber);
        transaction.setTransactionDate(LocalDateTime.now());
        BankTransaction saved = transactionRepository.save(transaction);
        // ensure in-memory model is consistent for the account
        account.getTransactions().add(saved);
    }

    private String generateUniqueAccountNumber() {
        String number;
        do {
            number = ibanGeneratorService.generate();
        } while (accountRepository.findByAccountNumber(number).isPresent());
        return number;
    }
}
