
package com.pictora.backend.service;

import com.pictora.backend.entity.UserAccount;
import com.pictora.backend.repository.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;

    public UserAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public UserAccount getById(UUID userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found: " + userId
                ));
    }

    @Transactional(readOnly = true)
    public Optional<UserAccount> findByProviderAndProviderSubject(
            String provider,
            String providerSubject
    ) {
        return userAccountRepository.findByProviderAndProviderSubject(
                provider,
                providerSubject
        );
    }

    @Transactional
    public UserAccount save(UserAccount userAccount) {
        return userAccountRepository.save(userAccount);
    }

    @Transactional(readOnly = true)
    public boolean usernameExists(String username) {
        return userAccountRepository.existsByUsername(username);
    }
}
