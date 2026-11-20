package com.yonder.backend.repositories;

import com.yonder.backend.models.Categorie;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Class name: CategorieRepository
 * Date: 11/19/2026
 * Programmer: Christian Bartle
 *
 * Description: 
 */

@Repository
public class CategorieRepository {
    private final JdbcTemplate jdbcTemplate;

    public CategorieRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Categorie> findByUserId(Long userId) {
        String sql = "SELECT user_id, museums, restaurants, beaches, parks, malls "
                + "FROM categories WHERE user_id = ?";

        List<Categorie> categories = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Categorie categorie = new Categorie();
            categorie.setUserId(rs.getLong("user_id"));
            categorie.setMuseums(rs.getInt("museums"));
            categorie.setRestaurants(rs.getInt("restaurants"));
            categorie.setBeaches(rs.getInt("beaches"));
            categorie.setParks(rs.getInt("parks"));
            categorie.setMalls(rs.getInt("malls"));
            return categorie;
        }, userId);

        return categories.stream().findFirst(); //first match is returned.
    }

    public Categorie save(Categorie categorie) {
        String sql = "INSERT INTO categories (user_id, museums, restaurants, beaches, parks, malls)"
                + "VALUES (?, ?, ?, ?, ?, ?)"; 
        jdbcTemplate.update(sql,
                categorie.getUserId(),
                categorie.getMuseums(),
                categorie.getRestaurants(),
                categorie.getBeaches(),
                categorie.getParks(),
                categorie.getMalls());
        return categorie;
    }


}
