package com.pictora.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "favorite_users",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "favorite_user_id"})
)
public class FavoriteUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "favorite_user_id", nullable = false)
    private UserAccount favoriteUser;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

    public UserAccount getFavoriteUser() {
        return favoriteUser;
    }

    public void setFavoriteUser(UserAccount favoriteUser) {
        this.favoriteUser = favoriteUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}