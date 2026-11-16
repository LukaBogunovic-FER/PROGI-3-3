
package com.pictora.backend.repository;

import com.pictora.backend.entity.FavoriteUser;
import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteUserRepository extends JpaRepository<FavoriteUser, UUID> {

    List<FavoriteUser> findByUser(UserAccount user);

    Optional<FavoriteUser> findByUserAndFavoriteUser(
            UserAccount user,
            UserAccount favoriteUser
    );

    boolean existsByUserAndFavoriteUser(
            UserAccount user,
            UserAccount favoriteUser
    );

    void deleteByUserAndFavoriteUser(
            UserAccount user,
            UserAccount favoriteUser
    );
}
