package com.yonder.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
class BackendApplicationTests {

	@DynamicPropertySource //this was added so it doesnt fail to launch
	static void jwtProperties(DynamicPropertyRegistry registry) {
		String jwtSecret = Dotenv.configure()
				.ignoreIfMissing()
				.load()
				.get("JWT_SECRET_KEY");
		if (jwtSecret == null || jwtSecret.isBlank()) {
			throw new IllegalStateException("JWT_SECRET_KEY is missing from .env");
		}
		registry.add("security.jwt.secret-key", () -> jwtSecret);
	}

	@Test
	void contextLoads() {
	}

}
