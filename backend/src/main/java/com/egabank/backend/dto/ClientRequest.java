package com.egabank.backend.dto;

import com.egabank.backend.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public record ClientRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull @Past LocalDate birthDate,
        @NotNull Gender gender,
        @NotBlank String address,
        @NotBlank @Pattern(regexp = "^[+0-9]{8,20}$") String phoneNumber,
        @NotBlank @Email String email,
        @NotBlank String nationality
) {
}
