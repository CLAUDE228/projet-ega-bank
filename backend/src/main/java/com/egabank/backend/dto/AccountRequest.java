package com.egabank.backend.dto;

import com.egabank.backend.enums.AccountType;
import jakarta.validation.constraints.NotNull;

public record AccountRequest(
        @NotNull AccountType type,
        @NotNull Long ownerId
) {
}
