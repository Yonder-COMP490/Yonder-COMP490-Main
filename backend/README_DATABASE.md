# Yonder-COMP490-Main
Comp 490 Senior design project Main repository, for the project YONDER... (Improve description)

Java download:
https://code.visualstudio.com/docs/languages/java

Build tool:
Maven for Java is included in the Extension Pack for Java. VS Code can run Maven goals through that extension; a separate Maven installation is optional when working through VS Code. To run the `mvn` command directly in a terminal, install Apache Maven and add it to PATH (https://maven.apache.org/install.html). --> Note from Bartle: I used the maven from the Extention pack, havent downloaded maven directly.

Extentions installed:
-Extension Pack for Java
-SQLTools - (by Matheus Teixeira)
-PostgreSQL - (by Microsoft)

## Backend database setup

### Local versions

- Java: Eclipse Temurin OpenJDK 25
- PostgreSQL: 18.6 Windows x64 installer
- PostgreSQL JDBC driver: 42.7.13 (pgJDBC)

The PostgreSQL installer installs the database server and related tools. The JDBC driver is a separate Java dependency; it must be on the Java project's classpath for Java code to connect to PostgreSQL. pgJDBC 42.7.13 supports Java 8 and newer and PostgreSQL 8.4 and newer. Driver testing is currently limited to PostgreSQL 9.1 and newer.

The Spring Boot Maven project is the `backend/` folder containing this README and `pom.xml`. There is no need to generate another project. Open this folder as the Maven project, or run commands from it.

## JDBC driver dependency

The pgJDBC 42.7.13 dependency is declared in `pom.xml`. Maven downloads the driver and adds it to the project's classpath when the project is built; do not download the JAR manually.

## Database credentials

Create a `backend/.env` file with your local database credentials. This file is ignored by Git; do not commit it.

```dotenv
DB_URL=jdbc:postgresql://localhost:5432/yonder
DB_USER=postgres
DB_PASSWORD=your_local_password
```

The backend loads these values at startup and configures Spring's datasource. You can also supply `DB_URL`, `DB_USER`, and `DB_PASSWORD` as environment variables instead of using a `.env` file.

## Initialize the database

Create the `yonder` database first, then run `src/main/resources/init.sql` once against it using pgAdmin's Query Tool or `psql`. The script creates the tables; it does not create the database and is not run automatically when the backend starts.

## Build and test

From the `backend/` directory, run the included Maven wrapper:

```powershell
./mvnw.cmd test
```

Alternatively, use the Maven for Java extension in VS Code to run the `test` goal. The wrapper and VS Code extension avoid the need to install Maven separately. Maven reads `pom.xml` and downloads declared dependencies; it does not recreate the project structure. Build output is generated in `target/` and does not need to be committed.

## Connection details

The default PostgreSQL port is `5432`. The local JDBC URL is configured in `.env` using this format:

```text
jdbc:postgresql://localhost:5432/DATABASE_NAME
```

Replace `yonder` with the database name you created if it differs. The PostgreSQL server must be running and accept connections before the Java application can start.

The driver is discovered automatically when its JAR is on the classpath; modern Java applications do not need to call `Class.forName("org.postgresql.Driver")`.

