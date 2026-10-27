
package com.yonder;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.sun.net.httpserver.HttpServer;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

public class HealthEndpointTest {

    private static HttpServer server;
    private static String healthUrl;

    private final HttpClient client = HttpClient.newHttpClient();

    @BeforeClass
    public static void setUp() throws Exception {
        // Port 0 allows the OS to choose an available port
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api/health", new HealthHandler());
        server.start();

        int port = server.getAddress().getPort();
        healthUrl = "http://127.0.0.1:" + port + "/api/health";
    }

    @AfterClass
    public static void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    public void testHealthEndpointReturns200() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(healthUrl))
                .GET()
                .build();

        HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"status\":\"ok\""));
        assertTrue(response.body().contains("\"service\":\"yonder-backend\""));
        assertTrue(response.headers()
                .firstValue("Content-Type")
                .orElse("")
                .startsWith("application/json"));
    }

    @Test
    public void testHealthEndpointRejectsPost() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(healthUrl))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(405, response.statusCode());
        assertEquals("GET", response.headers()
                .firstValue("Allow")
                .orElse(""));
    }
}
