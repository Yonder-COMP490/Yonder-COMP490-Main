package com.yonder.backend.repositories;

import com.yonder.backend.models.Cost;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CostsRepository {
    private final JdbcTemplate jdbcTemplate;

    public CostsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    //costID is a foreign key on the tables that use cost, so it is provided by whatever method wants to retrieve costs from database. Optinal is in case it doesnt find anything.
    public Optional<Cost> findById(Long costId) {
        String sql = """
                SELECT lower_end, upper_end, currency
                FROM costs
                WHERE cost_id = ?
                """;

        List<Cost> costs = jdbcTemplate.query(sql, (rs, rowNum) ->
                new Cost(
                        rs.getBigDecimal("lower_end"),
                        rs.getBigDecimal("upper_end"),
                        rs.getString("currency")),
                costId);

        return costs.stream().findFirst();
    }

    public Long save(Cost cost) {
        String sql = """
                INSERT INTO costs (lower_end, upper_end, currency)
                VALUES (?, ?, ?)
                RETURNING cost_id
                """;

        return jdbcTemplate.queryForObject(
                sql,
                Long.class,
                cost.getLowerEnd(),
                cost.getUpperEnd(),
                cost.getCurrency());
    }
}