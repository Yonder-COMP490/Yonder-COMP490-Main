package com.yonder.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		Dotenv.configure()
				.ignoreIfMissing()
				.load()
				.entries()
				.stream()
				.filter(entry -> entry.getKey().startsWith("DB_"))
				.forEach(entry -> {
					if (System.getProperty(entry.getKey()) == null) {
						System.setProperty(entry.getKey(), entry.getValue());
					}
				});

		SpringApplication.run(BackendApplication.class, args);
	}

}
