package com.egabank.backend.repository;

import com.egabank.backend.entity.BankTransaction;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long accountId,
            LocalDateTime start,
            LocalDateTime end
    );
}
