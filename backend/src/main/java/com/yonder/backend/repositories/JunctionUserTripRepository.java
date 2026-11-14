package com.yonder.backend.repositories;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.yonder.backend.models.Trip;
import com.yonder.backend.models.User;
import java.util.Optional;


/**
 * Class name: JunctionUserTrupRepository
 * Date: 11/13/2026
 * Programmer: Christian Bartle
 *
 * Description: This connects to the intermediate junction table between users and 
 * trips, as it is a table needed to keep track of the many-to-many relationships 
 * between the two. 
 * 
 * Functions:
 * - save(Long, Integer): stores the primary keys of user and trips to create a 
 *  composite primary key. It takes both UserId and TripId.
 * 
 * Data structures:
 * - Uses user and trip IDs to represent a user-trip association.
 *
 * Algorithm:
 * - Uses a parameterized INSERT query through JdbcTemplate.
 *
 * 
 * Note: this repository has room to be expanded, as depending on how future 
 * implementation goes, we might need to access the junction table and get the 
 * userid/trip id. For now it only saves the user/trip to the table. Also, a delete 
 * function might be necesary if its a trip with multiple users and one removes one 
 * user, as currently with the cascade the entries would only be deleted when one of 
 * the two ids get deleted, in this case most likely the trip once its done.
*/


@Repository
public class JunctionUserTripRepository {
    private final JdbcTemplate jdbcTemplate;

    public JunctionUserTripRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(Long userId, Integer tripId) {
        String sql = "INSERT INTO junctionusertrip (user_id, trip_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, userId, tripId);
    }

}
