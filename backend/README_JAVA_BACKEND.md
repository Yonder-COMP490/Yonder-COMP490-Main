Running the Spring Boot Backend Locally
1. Install Java JDK 21
- Download and install Eclipse Temurin JDK 21. (https://adoptium.net/temurin/releases)
- Select JDK 21 (not just a JRE).
- After installation, verify Java is installed by opening a terminal and running:
java -version


2. Open the Backend Directory
Open a terminal in the project's root directory and navigate to the backend folder:
cd backend


3. Run the Spring Boot Application
The project includes a Maven Wrapper, so you don't need to install Maven separately.

Windows:
.\mvnw.cmd spring-boot:run


Mac/Linux:
./mvnw spring-boot:run


The first launch may take a little longer because Maven needs to download the required dependencies.
4. Verify the Backend Is Running
Once Spring Boot starts successfully, you should see a message similar to:
Tomcat started on port 8080
Started BackendApplication


The backend is now running locally and accessible at:

http://localhost:8080

To stop the backend, press Ctrl + C in the terminal.