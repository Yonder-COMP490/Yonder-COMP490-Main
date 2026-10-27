package com.yonder;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.sun.net.httpserver.HttpServer;

import io.github.cdimascio.dotenv.Dotenv;

// small server for the maps page
// react asks this for hotels and it gets them from serpapi (google hotels api) with our key
// doing it here so the serpapi key isnt in the frontend
public class HotelServer {
    public static void main(String[] args) throws Exception {
        // uses the same .env as the database, needs SERPAPI_KEY=your-key in it
        Dotenv dotenv = Dotenv.configure()
                      .directory("./backend/yonder-backend")
                      .load();
        String apiKey = dotenv.get("SERPAPI_KEY");

        HttpClient client = HttpClient.newHttpClient();
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/health", new HealthHandler());

        // runs when react calls /api/hotels?q=...&check_in_date=...&check_out_date=...
        server.createContext("/api/hotels", exchange -> {
            // send the search to serpapi with our key
            String search = exchange.getRequestURI().getRawQuery();
            String url = "https://serpapi.com/search.json?engine=google_hotels&currency=USD&gl=us&hl=en&"
                    + search + "&api_key=" + apiKey;

            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(url)).build();
                HttpResponse<byte[]> answer = client.send(request, HttpResponse.BodyHandlers.ofByteArray());

                // lets the react app on port 5173 use this
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
                exchange.getResponseHeaders().add("Content-Type", "application/json");

                // send the results back to react
                exchange.sendResponseHeaders(answer.statusCode(), answer.body().length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(answer.body());
                }
            } catch (Exception e) {
                System.err.println("Hotel search failed!");
                e.printStackTrace();
                exchange.sendResponseHeaders(500, -1);
                exchange.close();
            }
        });

        server.start();
        System.out.println("Hotel server running at http://localhost:8080/api/hotels");
    }
}
