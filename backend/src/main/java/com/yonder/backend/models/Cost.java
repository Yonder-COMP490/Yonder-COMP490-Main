
package com.yonder.backend.models;

import java.math.BigDecimal;

public class Cost {
    private BigDecimal lowerEnd;
    private BigDecimal upperEnd;
    private String currency;

    public Cost() {
        this(BigDecimal.ZERO, BigDecimal.ZERO, "USD");
    }

    public Cost(BigDecimal amount, String currency) {
        this(amount, amount, currency);
    }

    public Cost(double amount, String currency) {
        this(BigDecimal.valueOf(amount), BigDecimal.valueOf(amount), currency);
    }

    public Cost(double lowerEnd, double upperEnd, String currency) {
        this(
            BigDecimal.valueOf(lowerEnd),
            BigDecimal.valueOf(upperEnd),
            currency
        );
    }

    public Cost(
        BigDecimal lowerEnd,
        BigDecimal upperEnd,
        String currency
    ) {
        this.lowerEnd = lowerEnd;
        this.upperEnd = upperEnd;
        this.currency = currency;
    }

    public BigDecimal getLowerEnd() {
        return lowerEnd;
    }

    public void setLowerEnd(BigDecimal lowerEnd) {
        this.lowerEnd = lowerEnd;
    }

    public BigDecimal getUpperEnd() {
        return upperEnd;
    }

    public void setUpperEnd(BigDecimal upperEnd) {
        this.upperEnd = upperEnd;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    // Keeps the existing frontend test compatible.
    public BigDecimal getAmount() {
        return lowerEnd;
    }

    public void setAmount(BigDecimal amount) {
        this.lowerEnd = amount;
        this.upperEnd = amount;
    }

    public Cost add(Cost other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                "Cannot add costs with different currencies."
            );
        }

        return new Cost(
            lowerEnd.add(other.lowerEnd),
            upperEnd.add(other.upperEnd),
            currency
        );
    }

    public Cost multiply(int quantity) {
        BigDecimal multiplier = BigDecimal.valueOf(quantity);

        return new Cost(
            lowerEnd.multiply(multiplier),
            upperEnd.multiply(multiplier),
            currency
        );
    }
}
