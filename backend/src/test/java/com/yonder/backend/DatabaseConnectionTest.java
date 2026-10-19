package com.yonder.backend;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.junit.jupiter.api.Test;

import io.github.cdimascio.dotenv.Dotenv;

class DatabaseConnectionTest {

    @Test
    void connectsToPostgres() throws SQLException {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String url = setting("DB_URL", dotenv);
        String username = setting("DB_USER", dotenv);
        String password = setting("DB_PASSWORD", dotenv);

        assumeTrue(url != null && !url.isBlank(), "Set DB_URL to run the database connection test.");
        assumeTrue(username != null && !username.isBlank(), "Set DB_USER to run the database connection test.");

        try (Connection connection = DriverManager.getConnection(
                url,
                username,
                password == null ? "" : password)) {
            assertTrue(connection.isValid(2), "PostgreSQL connection should be valid.");
        }
    }

    private static String setting(String name, Dotenv dotenv) {
        String value = System.getenv(name);
        return value != null ? value : dotenv.get(name);
    }
}