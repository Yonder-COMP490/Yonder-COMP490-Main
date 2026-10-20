package com.yonder.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleUnreadableMessage(
            HttpMessageNotReadableException exception) {

        System.err.println("\n=== JSON REQUEST PARSING ERROR ===");

        Throwable cause = exception;

        while (cause != null) {
            System.err.println(
                cause.getClass().getName() + ": " + cause.getMessage()
            );

            cause = cause.getCause();
        }

        System.err.println("=== END JSON PARSING ERROR ===\n");

        return "Invalid request JSON. Check the backend terminal.";
    }
}