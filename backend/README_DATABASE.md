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

The Java Maven project is in `yonder-backend/`. There is no need to generate it again; after cloning the repository and setting up Java plus Maven tooling (the VS Code extension or a standalone Maven install), run Maven commands from that directory.

## JDBC driver dependency

The pgJDBC 42.7.13 dependency is declared in `yonder-backend/pom.xml`. Maven downloads the driver and adds it to the project's classpath when the project is built; no need to download the JAR manually or configure it in VS Code. ( Bartle: I first tried the JAR directly, let the build in mavel do it instead)

## Build and test

With Apache Maven installed and available on PATH, open a terminal in `backend/yonder-backend/` and run:

```powershell
mvn test
```

Alternatively, use the Maven for Java extension in VS Code to run the `test` goal. Maven reads the project configuration from `pom.xml` and downloads declared dependencies. It does not recreate the project structure. Build output is generated in `target/` and does not need to be committed.

## Connection details

The default PostgreSQL port is `5432`. A JDBC URL has this format:

```text
jdbc:postgresql://localhost:5432/DATABASE_NAME
```

Replace `DATABASE_NAME` with the database you created. Supply the database username and password through your application's configuration; do not commit real credentials to the repository. The PostgreSQL server must be running and accept connections before the Java application can connect.

The driver is discovered automatically when its JAR is on the classpath; modern Java applications do not need to call `Class.forName("org.postgresql.Driver")`.

