package com.yonder.backend.repositories;

import com.yonder.backend.models.Profile;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Class name: ProfileRepository
 * Date: 11/12/2026
 * Programmer: Christian Bartle
 *
 * Description: Handles database access for profile-related records using
 * JdbcTemplate. It maps database rows to profile objects and saves profiles
 * when a user is saved.
 *
 * Functions:
 * - findByUserId(Long): Looks up a profile by its user ID and returns an
 *   {@code Optional<Profile>}. The Optional is empty if no matching profile is found.
 *
 * - save(Profile): Inserts a profile into the profiles table and returns the
 *   Profile object.
 *
 * Data structures:
 * - Uses Profile to represent a profile row from the database.
 * - Uses {@code List<Profile>} to hold query results returned by JdbcTemplate.
 * - Uses {@code Optional<Profile>} to represent a profile that may not be found.
 *
 * Algorithm:
 * - Uses parameterized SQL queries through JdbcTemplate.
 * - Maps the columns returned by the database to a Profile object.
 */

@Repository
public class ProfileRepository {
    private final JdbcTemplate jdbcTemplate;

    public ProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Profile> findByUserId(Long userId) {
        String sql = "SELECT user_id, first_name, last_name, bio, avatar_url "
                + "FROM profiles WHERE user_id = ?"; // the ? is placeholder for the parameter that will be passed, the userId, once it actually runs.
        List<Profile> profiles = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Profile profile = new Profile();
            profile.setUserId(rs.getLong("user_id"));
            profile.setFirstName(rs.getString("first_name"));
            profile.setLastName(rs.getString("last_name"));
            profile.setBio(rs.getString("bio"));
            profile.setAvatarUrl(rs.getString("avatar_url"));
            return profile;
        }, userId);

        return profiles.stream().findFirst();
    }

    public Profile save(Profile profile) {
        String sql = "INSERT INTO profiles (user_id, first_name, last_name, bio, avatar_url) "
                + "VALUES (?, ?, ?, ?, ?)"; //Similar as above, the ? are placeholders for the parameters that will be passed, as seen right bellow.
        jdbcTemplate.update(sql,
                profile.getUserId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getBio(),
                profile.getAvatarUrl());
        return profile;
    }

    //Update profile not yet implemented. Profiles need to be able to be changed latter on, as they are created mostly empty since it doesnt promp the user to create a profile right after registering. depending on how we want to implement it the function changes, as a user may not want to change everythinmg at once, maybe just one thing in the profile, thus, it could be one single update, or several update functions, each for one field in the profile.

    //public boolean update(Profile profile) {
    //
    //}

}
