package com.yonder;
/*
public class App 
{
    public static void main( String[] args )
    {
        System.out.println( "Hello World!" );
    }
}
*/

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
//import java.sql.Statement; //import java.sql.ResultSet;

import io.github.cdimascio.dotenv.Dotenv;

public class App { //changing the class name changes the java file name.
    public static void main(String[] args) {
        //Dotenv dotenv = Dotenv.load();
        Dotenv dotenv = Dotenv.configure()
                      .directory("./backend/yonder-backend") // Tells Java to look inside the subfolder rather than the root folder for the .env file 
                      .load();

        // These credentials are placeholders for the actual database credentials, you will need to change them to your own
        // credentials in the .env file. (create a .env file in the backend/yonder-backend folder and add 
        // your own credentials to it, then add the .env file to your 
        // .gitignore file so you don't accidentally commit it to the repo.)
        // 
        // .env file content format:
        //  DB_URL=jdbc:postgresql://localhost:5432/DatabaseName
        //  DB_USER=Username
        //  DB_PASSWORD=Password

        String url =  dotenv.get("DB_URL"); 
        String user = dotenv.get("DB_USER"); 
        String password = dotenv.get("DB_PASSWORD");  

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            if (conn != null) {
                System.out.println("Success! Backend successfully connected to PostgreSQL 18.");
            }
        } catch (SQLException e) {
            System.err.println("Connection failed!");
            e.printStackTrace();
        }
    }
}
