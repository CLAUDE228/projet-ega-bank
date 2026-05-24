package com.egabank.backend.service;

import com.egabank.backend.dto.AccountResponse;
import com.egabank.backend.dto.ClientRequest;
import com.egabank.backend.dto.ClientResponse;
import com.egabank.backend.entity.Client;
import com.egabank.backend.exception.BusinessException;
import com.egabank.backend.exception.ResourceNotFoundException;
import com.egabank.backend.repository.ClientRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<ClientResponse> findAll() {
        return clientRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ClientResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public ClientResponse create(ClientRequest request) {
        clientRepository.findByEmail(request.email()).ifPresent(c -> {
            throw new BusinessException("Un client avec cet email existe deja");
        });
        Client client = new Client();
        mapRequest(client, request);
        return toResponse(clientRepository.save(client));
    }

    public ClientResponse update(Long id, ClientRequest request) {
        Client client = getEntity(id);
        clientRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(c -> {
                    throw new BusinessException("Un client avec cet email existe deja");
                });
        mapRequest(client, request);
        return toResponse(clientRepository.save(client));
    }

    public void delete(Long id) {
        clientRepository.delete(getEntity(id));
    }

    public Client getEntity(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable: " + id));
    }

    public ClientResponse toResponse(Client client) {
        List<AccountResponse> accounts = client.getAccounts().stream()
                .map(account -> new AccountResponse(
                        account.getId(),
                        account.getAccountNumber(),
                        account.getType(),
                        account.getCreatedAt(),
                        account.getBalance(),
                        client.getId(),
                        client.getFirstName() + " " + client.getLastName()
                ))
                .toList();
        return new ClientResponse(
                client.getId(),
                client.getFirstName(),
                client.getLastName(),
                client.getBirthDate(),
                client.getGender(),
                client.getAddress(),
                client.getPhoneNumber(),
                client.getEmail(),
                client.getNationality(),
                accounts
        );
    }

    private void mapRequest(Client client, ClientRequest request) {
        client.setFirstName(request.firstName());
        client.setLastName(request.lastName());
        client.setBirthDate(request.birthDate());
        client.setGender(request.gender());
        client.setAddress(request.address());
        client.setPhoneNumber(request.phoneNumber());
        client.setEmail(request.email());
        client.setNationality(request.nationality());
    }
}
