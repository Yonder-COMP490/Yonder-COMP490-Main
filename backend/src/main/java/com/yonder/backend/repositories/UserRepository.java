package com.yonder.backend.repositories;

import com.yonder.backend.models.User;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository 

public class UserRepository {
    private final JdbcTemplate jdbcTemplate;
    
    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> users = jdbcTemplate.query(sql, (rs, rowNum) -> {
            User user = new User();
            user.setUserId(rs.getLong("user_id"));
            user.setEmail(rs.getString("email"));
            user.setPasswordHash(rs.getString("password_hash"));
            user.setCreatedAt(rs.getString("created_at"));
            return user;
        }, email);

        return users.stream().findFirst();
    }

    public void save(User user) {
        String sql = "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, user.getEmail(), user.getPasswordHash(), user.getCreatedAt());
    }

}
