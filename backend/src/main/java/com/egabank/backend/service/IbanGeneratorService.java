package com.egabank.backend.service;

import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class IbanGeneratorService {

    public String generate() {
        // iban4j builder may require country-specific fields (national check digit) for some countries
        // to avoid runtime issues during initialization we fallback to a simple bank-style account id
        String prefix = "EGAB";
        String rnd = String.format("%014d", ThreadLocalRandom.current().nextLong(0, 99999999999999L));
        return prefix + rnd;
    }
}
