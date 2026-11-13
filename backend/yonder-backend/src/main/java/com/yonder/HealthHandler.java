
package com.yonder;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Handles the legacy backend's {@code GET /api/health} endpoint.
 * Responds with a JSON status payload when the server is running,
 * and rejects other HTTP methods with status 405 and an Allow header.
 *
 * @author A. Garcia
 * @version 1.0
 * @since 2026-10-21
 */
public class HealthHandler implements HttpHandler {

    /**
     * Processes a health-check request and writes the response.
     * Permits GET requests, returns HTTP 200 with a JSON body,
     * and responds with HTTP 405 for unsupported methods.
     *
     * @param exchange the current HTTP request and response exchange
     * @throws IOException if the response cannot be written
     */
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // Only allow GET requests
        if (!exchange.getRequestMethod().equals("GET")) {
            exchange.getResponseHeaders().set("Allow", "GET");
            exchange.sendResponseHeaders(405, -1);
            exchange.close();
            return;
        }

        // Return JSON confirming the backend is running
        String response =
                "{\"status\":\"ok\",\"service\":\"yonder-backend\"}";

        byte[] responseBytes =
                response.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
                "Content-Type",
                "application/json; charset=UTF-8"
        );

        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Origin",
                "http://localhost:5173"
        );

        exchange.sendResponseHeaders(200, responseBytes.length);

        try (OutputStream out = exchange.getResponseBody()) {
            out.write(responseBytes);
        }
    }
}
