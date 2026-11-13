package com.yonder.backend.repositories;

import com.yonder.backend.models.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Class name: UserRepository
 * Date: 10/21/2026
 * Programmer: Christian Bartle
 *
 * Description: Handles database access for user records using JdbcTemplate.
 * It maps database rows to User objects and saves new users to the users table.
 *
 * Functions:
 * - findByEmail(String): Accepts an email, queries the users table, and returns
 *   an Optional<User>. The Optional is empty if no matching user is found.
 * - save(User): Accepts a User, inserts its email and password hash, and
 *   returns the User populated with the database-generated ID and creation
 *   timestamp.
 *
 * Data structures:
 *  - Uses User to represent a database record(row).
 *  - List<User> to hold query results.
 *  - Optional<User> to represent a (possibly missing) user.
 *
 * Algorithm:
 *  - Runs parameterized SQL queries through JdbcTemplate. The query
 *    parameter is bound separately from the SQL text, and each result row is
 *    mapped into a User object.
 */


@Repository

public class UserRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?"; // ? is a placeholder for the next line, where it is replaced by the given email in the function parameter.
        List<User> users = jdbcTemplate.query(sql, (rs, rowNum) -> {
            User user = new User();
            user.setUserId(rs.getLong("user_id"));
            user.setEmail(rs.getString("email"));
            user.setPasswordHash(rs.getString("password_hash"));
            user.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
            return user;
        }, email);

        return users.stream().findFirst();
    }

    public User save(User user) {
        String sql = "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING user_id, created_at";
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            user.setUserId(rs.getLong("user_id"));
            user.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
            return user;
        }, user.getEmail(), user.getPasswordHash());
    }

}
