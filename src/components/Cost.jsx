class Cost {
  constructor(lowerEnd = 0, upperEnd = lowerEnd, currency = "USD") {
    this.lowerEnd = lowerEnd;
    this.upperEnd = Math.max(lowerEnd, upperEnd);
    this.currency = currency;
  }

  addCost(otherCost) {
    if (this.currency !== otherCost.currency) {
      throw new Error(
        `Cannot add ${otherCost.currency} cost to ${this.currency} cost.`
      );
    }

    this.lowerEnd += otherCost.lowerEnd;
    this.upperEnd += otherCost.upperEnd;
  }

  toString() {
    if (this.lowerEnd === this.upperEnd) {
      return `${this.lowerEnd} ${this.currency}`;
    }

    return `${this.lowerEnd}-${this.upperEnd} ${this.currency}`;
  }
}

export default Cost;