package com.yonder.backend.repositories;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.Cost;
import com.yonder.backend.models.Description;
import com.yonder.backend.models.Location;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ActivitiesRepository {
    private final JdbcTemplate jdbcTemplate;
    private final CostsRepository costsRepository;

    public ActivitiesRepository(JdbcTemplate jdbcTemplate, CostsRepository costsRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.costsRepository = costsRepository;
    }

    public List<Activity> findByTripId(int tripId) {
        String sql = """
                SELECT a.activity_id, a.activity_name, a.picture_url, a.activity_status,
                       a.tripDay, a.activityDate, a.startTime, a.endTime, a.activityNotes,
                       a.location_address, a.activity_latitude, a.activity_longitude,
                       c.lower_end, c.upper_end, c.currency
                FROM activities a
                JOIN costs c ON c.cost_id = a.cost_id
                WHERE a.trip_id = ?
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Activity activity = new Activity();
            activity.setId(rs.getInt("activity_id"));
            activity.setActive(rs.getBoolean("activity_status"));

            Integer tripDay = rs.getObject("tripDay", Integer.class);
            LocalDate activityDate = rs.getObject("activityDate", LocalDate.class);
            if (activityDate != null) {
                activity.setFixedDate(activityDate);
            } else {
                activity.setTripDay(tripDay);
            }

            activity.setStartTime(rs.getObject("startTime", java.time.LocalTime.class));
            activity.setEndTime(rs.getObject("endTime", java.time.LocalTime.class));
            activity.setDescription(new Description(
                    rs.getString("activity_name"),
                    null,
                    rs.getString("activityNotes"),
                    rs.getString("picture_url")));
            activity.setLocation(new Location(
                    rs.getString("location_address"),
                    (Double) rs.getObject("activity_latitude"),
                    (Double) rs.getObject("activity_longitude")));
            activity.setCost(new Cost(
                    rs.getBigDecimal("lower_end"),
                    rs.getBigDecimal("upper_end"),
                    rs.getString("currency")));
            return activity;
        }, tripId);
    }

    @Transactional
    public Activity save(Activity activity, int tripId) {
        Long costId = costsRepository.save(activity.getCost());
        String sql = """
                INSERT INTO activities (
                    activity_name, picture_url, activity_status, tripDay, activityDate,
                    startTime, endTime, trip_id, cost_id, activityNotes, location_address,
                    activity_latitude, activity_longitude
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING activity_id
                """;
        Integer generatedId = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                activity.getDescription().getName(),
                activity.getDescription().getPicture(),
                activity.isActive(),
                activity.getTripDay(),
                activity.getFixedDate(),
                activity.getStartTime(),
                activity.getEndTime(),
                tripId,
                costId,
                activity.getDescription().getNotes(),
                activity.getLocation().getReadableAddress(),
                activity.getLocation().getLatitude(),
                activity.getLocation().getLongitude());
        activity.setId(generatedId);
        return activity;
    }
}
