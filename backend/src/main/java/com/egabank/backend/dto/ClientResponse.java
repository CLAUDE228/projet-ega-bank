package com.egabank.backend.dto;

import com.egabank.backend.enums.Gender;
import java.time.LocalDate;
import java.util.List;

public record ClientResponse(
        Long id,
        String firstName,
        String lastName,
        LocalDate birthDate,
        Gender gender,
        String address,
        String phoneNumber,
        String email,
        String nationality,
        List<AccountResponse> accounts
) {
}
