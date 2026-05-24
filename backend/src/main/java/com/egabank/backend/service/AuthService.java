package com.egabank.backend.service;

import com.egabank.backend.dto.AuthRequest;
import com.egabank.backend.dto.AuthResponse;
import com.egabank.backend.entity.AppUser;
import com.egabank.backend.entity.Client;
import com.egabank.backend.repository.UserRepository;
import com.egabank.backend.repository.ClientRepository;
import com.egabank.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UserDetailsService userDetailsService, UserRepository userRepository,
                       ClientRepository clientRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtService.generateToken(userDetails);
        AppUser user = userRepository.findByUsername(request.username()).orElseThrow();
        Long clientId = user.getClient() == null ? null : user.getClient().getId();
        return new AuthResponse(token, "Bearer", user.getUsername(), user.getRole(), clientId);
    }

    public AuthResponse register(com.egabank.backend.dto.RegisterRequest request) {
        userRepository.findByUsername(request.username()).ifPresent(u -> {
            throw new RuntimeException("Username already exists");
        });
        com.egabank.backend.entity.AppUser user = new com.egabank.backend.entity.AppUser();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_USER");
        // create a minimal Client and link to the new user so frontend receives a clientId
        Client client = new Client();
        client.setEmail(user.getUsername());
        clientRepository.save(client);
        user.setClient(client);
        userRepository.save(user);

        // generate token after registration
        org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtService.generateToken(userDetails);
        Long clientId = client.getId();
        return new AuthResponse(token, "Bearer", user.getUsername(), user.getRole(), clientId);
    }
}
