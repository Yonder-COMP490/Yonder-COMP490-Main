package com.yonder.backend.repositories;

import com.yonder.backend.models.Profile;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
}
