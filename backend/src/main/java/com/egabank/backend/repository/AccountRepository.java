package com.egabank.backend.repository;

import com.egabank.backend.entity.Account;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
    java.util.List<Account> findByOwnerId(Long ownerId);
}
