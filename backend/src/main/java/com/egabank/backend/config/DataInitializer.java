package com.egabank.backend.config;

import com.egabank.backend.entity.AppUser;
import com.egabank.backend.entity.Account;
import com.egabank.backend.entity.BankTransaction;
import com.egabank.backend.entity.Client;
import com.egabank.backend.enums.TransactionType;
import com.egabank.backend.repository.AccountRepository;
import com.egabank.backend.repository.ClientRepository;
import com.egabank.backend.repository.TransactionRepository;
import com.egabank.backend.repository.UserRepository;
import com.egabank.backend.service.IbanGeneratorService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner seedUsersAndDemoData(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                           ClientRepository clientRepository, AccountRepository accountRepository,
                                           TransactionRepository transactionRepository, IbanGeneratorService ibanGeneratorService) {
        return args -> {
            logger.info("Starting data initializer");
            if (userRepository.findByUsername("admin").isEmpty()) {
                AppUser admin = new AppUser();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
                logger.info("Created default admin user: admin");
            }

            // Ensure at least 10 clients
            int target = 10;
            int clientsToCreate = target - (int) clientRepository.count();
            if (clientsToCreate > 0) {
                logger.info("Seeding {} demo clients...", clientsToCreate);
                for (int i = 1; i <= clientsToCreate; i++) {
                    int idx = (int) clientRepository.count() + 1;
                    Client client = new Client();
                    client.setFirstName("Client" + idx);
                    client.setLastName("Demo" + idx);
                    client.setBirthDate(LocalDate.of(1980 + (idx % 30), (idx % 12) + 1, (idx % 27) + 1));
                    client.setGender(idx % 2 == 0 ? com.egabank.backend.enums.Gender.MALE : com.egabank.backend.enums.Gender.FEMALE);
                    client.setAddress("Demo Address " + idx);
                    client.setPhoneNumber("+2237000000" + String.format("%02d", idx));
                    client.setEmail("client" + idx + "@example.com");
                    client.setNationality("DemoLand");
                    clientRepository.save(client);

                    // create a user for authentication for this client and associate the client
                    String uname = "client" + idx;
                    if (userRepository.findByUsername(uname).isEmpty()) {
                        AppUser user = new AppUser();
                        user.setUsername(uname);
                        user.setPassword(passwordEncoder.encode("password"));
                        user.setRole("ROLE_USER");
                        user.setClient(client);
                        userRepository.save(user);
                    }
                }
            }

            // Ensure at least 10 accounts
            int accountsToCreate = target - (int) accountRepository.count();
            if (accountsToCreate > 0) {
                logger.info("Seeding {} demo accounts...", accountsToCreate);
                // attach accounts to existing clients
                var clients = clientRepository.findAll();
                for (int i = 0; i < accountsToCreate; i++) {
                    Client owner = clients.get(i % clients.size());
                    Account account = new Account();
                    account.setOwner(owner);
                    account.setAccountNumber(ibanGeneratorService.generate());
                    account.setCreatedAt(LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(1, 60)));
                    BigDecimal balance = BigDecimal.valueOf(ThreadLocalRandom.current().nextInt(1000, 10000));
                    account.setBalance(balance);
                    accountRepository.save(account);
                    // initial transaction per created account
                    BankTransaction tx = new BankTransaction();
                    tx.setAccount(account);
                    tx.setType(TransactionType.DEPOSIT);
                    tx.setAmount(balance);
                    tx.setDescription("Initial deposit");
                    tx.setTransactionDate(LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(0, 30)));
                    transactionRepository.save(tx);
                }
            }

            // Ensure at least 10 transactions total
            int transactionsToCreate = target - (int) transactionRepository.count();
            if (transactionsToCreate > 0) {
                logger.info("Seeding {} demo transactions...", transactionsToCreate);
                var accounts = accountRepository.findAll();
                for (int i = 0; i < transactionsToCreate; i++) {
                    Account acc = accounts.get(i % accounts.size());
                    BankTransaction tx = new BankTransaction();
                    tx.setAccount(acc);
                    tx.setType(TransactionType.DEPOSIT);
                    tx.setAmount(BigDecimal.valueOf(ThreadLocalRandom.current().nextInt(50, 5000)));
                    tx.setDescription("Seed transaction " + (i + 1));
                    tx.setTransactionDate(LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(0, 60)));
                    transactionRepository.save(tx);
                }
            }
        };
    }
}
