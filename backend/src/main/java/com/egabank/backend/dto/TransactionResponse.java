package com.egabank.backend.dto;

import com.egabank.backend.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        LocalDateTime transactionDate,
        String description,
        String relatedAccountNumber
) {
}
