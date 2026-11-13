
package com.yonder.backend;

import java.time.LocalDate;

/**
 * Represents the information required to create a new trip
 * in the Yonder travel planning application.
 *
 * This record serves as a data transfer object (DTO) for
 * trip creation requests. It contains the trip name, start
 * and end dates, and preferred currency.
 *
 * @param name the name of the new trip
 * @param startDate the trip's starting date
 * @param endDate the trip's ending date
 * @param preferredCurrency the currency used for trip expenses
 *
 * @author A. Garcia
 * @version 1.0
 * @since 2026-11-12
 */
public record CreateTripRequest(
    String name,
    LocalDate startDate,
    LocalDate endDate,
    String preferredCurrency
) {}
