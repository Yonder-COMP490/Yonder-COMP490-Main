package com.yonder.backend.repositories;

import com.yonder.backend.models.Trip;
import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Class name: TripRepository
 * Date: 11/13/2026
 * Programmer: Christian Bartle
 * 
 * Description: Handles database access for trip records using JdbcTemplate.
 * Maps rows from the trips table to Trip objects and inserts new trips.
 *
 * Functions:
 * - findByTripId(Long): Finds a trip by its ID and returns an Optional that
 *   is empty if no matching trip exists.
 * - save(Trip): Inserts a trip, sets its generated database ID, and returns it.
 *
 *  Notes:
 * -This repository is not yet complete, as currently it only saves the trip or finds the trip: 
 * it does not have a function to update the trip, yet. 
 * -The trip controller still uses local memory, it is 
 *  yet to be updated to use this repository to save it to the database.
 */
@Repository
public class TripRepository {
    private final JdbcTemplate jdbcTemplate;

    public TripRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Trip> findByTripId(Long tripId) {
        String sql = "SELECT trip_id, trip_name, start_date, end_date, preferredCurrency "
                + "FROM trips WHERE trip_id = ?"; // the ? is placeholder for the parameter that will be passed, the tripID, once it actually runs.
        List<Trip> trips = jdbcTemplate.query(sql, (rs, rowNum) -> {
            LocalDate startDate = rs.getObject("start_date", LocalDate.class);
            LocalDate endDate = rs.getObject("end_date", LocalDate.class);
            Trip trip = new Trip();
            trip.setId(rs.getInt("trip_id"));
            trip.setName(rs.getString("trip_name"));
            trip.setStartDate(startDate);
            trip.setDays(endDate == null
                    ? 1
                    : Math.toIntExact(ChronoUnit.DAYS.between(startDate, endDate) + 1)); //if there is no enddate, the days are set as 1. If there is an enddate, the days are calculated instead using the startdate and endate information.
            trip.setPreferredCurrency(rs.getString("preferredCurrency"));
            return trip;
        }, tripId);

        return trips.stream().findFirst();
    }

    public Trip save(Trip trip) {
        LocalDate endDate = trip.getStartDate().plusDays(trip.getDays() - 1L);
        String sql = "INSERT INTO trips (trip_name, start_date, end_date, preferredCurrency) "
                + "VALUES (?, ?, ?, ?) RETURNING trip_id";
        Integer generatedId = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                trip.getName(),
                Date.valueOf(trip.getStartDate()),
                Date.valueOf(endDate),
                trip.getPreferredCurrency());
        trip.setId(generatedId);
        return trip;
    }
}
