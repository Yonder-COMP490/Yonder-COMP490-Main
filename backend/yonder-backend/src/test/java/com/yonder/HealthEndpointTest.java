
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

/**
 * Integration tests for the legacy backend health endpoint.
 * Starts a temporary local HTTP server to verify successful
 * GET requests and rejection of unsupported POST requests.
 *
 * @author A. Garcia
 * @version 1.0
 * @since 2026-10-21
 */
public class HealthEndpointTest {

    private static HttpServer server;
    private static String healthUrl;

    private final HttpClient client = HttpClient.newHttpClient();

    /**
     * Starts a local test server on an automatically assigned port.
     * Registers the health-check handler before running the tests.
     *
     * @throws Exception if the test server cannot be started
     */
    @BeforeClass
    public static void setUp() throws Exception {
        // Port 0 allows the OS to choose an available port
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api/health", new HealthHandler());
        server.start();

        int port = server.getAddress().getPort();
        healthUrl = "http://127.0.0.1:" + port + "/api/health";
    }

    /**
     * Stops the test server after all health endpoint tests complete.
     */
    @AfterClass
    public static void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    /**
     * Verifies that GET returns HTTP 200, the expected status JSON,
     * and the application/json content type.
     *
     * @throws Exception if the HTTP test request fails
     */
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

    /**
     * Verifies that POST is rejected with HTTP 405 and an Allow: GET header.
     *
     * @throws Exception if the HTTP test request fails
     */
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
