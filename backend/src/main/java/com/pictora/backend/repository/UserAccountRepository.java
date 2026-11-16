
package com.pictora.backend.repository;

import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByProviderAndProviderSubject(
            String provider,
            String providerSubject
    );

    boolean existsByUsername(String username);
}
