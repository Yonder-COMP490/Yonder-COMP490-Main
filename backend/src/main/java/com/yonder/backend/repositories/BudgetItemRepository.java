package com.yonder.backend.repositories;

import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.Cost;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class BudgetItemRepository {
    private final JdbcTemplate jdbcTemplate;
    private final CostsRepository costsRepository;

    public BudgetItemRepository(JdbcTemplate jdbcTemplate, CostsRepository costsRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.costsRepository = costsRepository;
    }


    public List<BudgetItem> findByTripId(int tripId) { //no optional here since a trip can return several budgetItems, so a list is used instead.
        String sql = """
            SELECT bi.budgetItem_id, bi.budgetItem_name, bi.budgetItem_days,
                   c.lower_end, c.upper_end, c.currency
            FROM budgetItem bi
            JOIN costs c ON c.cost_id = bi.cost_id
            WHERE bi.trip_id = ?
            """; //The FROM budgeitem bi allows us to callbudgeItem by the allias bi in sql.


        List<BudgetItem> budgetItems = jdbcTemplate.query(sql, (rs, rowNum) -> {
            BudgetItem budgetItem = new BudgetItem();
            budgetItem.setId(rs.getInt("budgetItem_id"));
            budgetItem.setName(rs.getString("budgetItem_name"));
            budgetItem.setCost(new Cost(
                rs.getBigDecimal("lower_end"),
                rs.getBigDecimal("upper_end"),
                rs.getString("currency")));
            budgetItem.setDays(rs.getInt("budgetItem_days"));
            
            return budgetItem;
        }, tripId);

        return budgetItems;
    }

    @Transactional
    public BudgetItem save(BudgetItem budgetItem, int tripId) {
        Long costId = costsRepository.save(budgetItem.getCost());
        String sql = """
                INSERT INTO budgetItem (budgetItem_name, trip_id, cost_id, budgetItem_days)
                VALUES (?, ?, ?, ?)
                RETURNING budgetItem_id
                """;
        Integer generatedId = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                budgetItem.getName(),
                tripId,
                costId,
                budgetItem.getDays());
        budgetItem.setId(generatedId);
        return budgetItem;
    }

}
