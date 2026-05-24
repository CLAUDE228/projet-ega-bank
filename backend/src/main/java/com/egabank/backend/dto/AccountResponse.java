package com.egabank.backend.dto;

import com.egabank.backend.enums.AccountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        AccountType type,
        LocalDateTime createdAt,
        BigDecimal balance,
        Long ownerId,
        String ownerFullName
) {
}
