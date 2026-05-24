package com.egabank.backend.config;

import com.egabank.backend.entity.AppUser;
import com.egabank.backend.entity.Client;
import com.egabank.backend.repository.UserRepository;
import com.egabank.backend.repository.ClientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class BackfillClientsRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    public BackfillClientsRunner(UserRepository userRepository, ClientRepository clientRepository) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        List<AppUser> users = userRepository.findAll();
        int created = 0, linked = 0;
        for (AppUser u : users) {
            if (u.getClient() != null) continue; // already linked
            // skip admins
            if (u.getRole() != null && u.getRole().equals("ROLE_ADMIN")) continue;

            // try to find existing client by email (username)
            String email = u.getUsername();
            Client c = clientRepository.findByEmail(email).orElse(null);
            if (c == null) {
                c = new Client();
                c.setEmail(email);
                // minimal data; you can enrich later
                clientRepository.save(c);
                created++;
            }
            u.setClient(c);
            userRepository.save(u);
            linked++;
        }
        if (created + linked > 0) {
            System.out.println("BackfillClientsRunner: created clients=" + created + " linked users=" + linked);
        } else {
            System.out.println("BackfillClientsRunner: no users to backfill");
        }
    }
}
