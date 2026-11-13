package com.yonder.backend;

import java.time.LocalDate;

public record CreateTripRequest(
    String name,
    LocalDate startDate,
    LocalDate endDate,
    String preferredCurrency
) {}