
package com.pictora.backend.service;

import com.pictora.backend.entity.UserAccount;
import com.pictora.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;

    public UserAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserAccount getUserById(UUID id) {
        return userAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserAccount getUserByUsername(String username) {
        return userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserAccount getUserByProvider(String provider, String providerSubject) {
        return userAccountRepository
                .findByProviderAndProviderSubject(provider, providerSubject)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
