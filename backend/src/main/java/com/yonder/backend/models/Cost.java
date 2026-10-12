
package com.yonder.backend.models;

import java.math.BigDecimal;

public class Cost {
    private BigDecimal amount;
    private String currency;

    public Cost() {
        this(BigDecimal.ZERO, "USD");
    }

    public Cost(BigDecimal amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    public Cost(double amount, String currency) {
        this(BigDecimal.valueOf(amount), currency);
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Cost add(Cost other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                "Cannot add costs with different currencies."
            );
        }

        return new Cost(amount.add(other.amount), currency);
    }

    public Cost multiply(int quantity) {
        return new Cost(amount.multiply(BigDecimal.valueOf(quantity)), currency);
    }
}
