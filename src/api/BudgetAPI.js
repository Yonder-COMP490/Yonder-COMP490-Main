
const API_BASE = "http://localhost:8080/api/trips";

function tripUrl(tripId) {
  const id = Number(tripId);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error("A valid trip ID is required.");
  }

  return `${API_BASE}/${id}`;
}

function serializeBudgetItem(item) {
  return {
    id: item.id ?? 0,
    name: item.name,
    cost: {
      lowerEnd: item.cost?.lowerEnd ?? 0,
      upperEnd:
        item.cost?.upperEnd ??
        item.cost?.lowerEnd ??
        0,
      currency: item.cost?.currency ?? "USD",
    },
    days: item.days ?? 1,
  };
}

class BudgetAPI {
  /**
   * Retrieves the calculated budget for a selected trip.
   */
  async getSummary(tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/budget`
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to load budget (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Adds a daily budget item to a selected trip.
   */
  async add(item, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/budget-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serializeBudgetItem(item)),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to add budget item (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Updates a budget item belonging to a selected trip.
   */
  async update(id, item, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/budget-items/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...serializeBudgetItem(item),
          id,
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to update budget item (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Deletes a budget item from a selected trip.
   */
  async remove(id, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/budget-items/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to remove budget item (${response.status}): ${details}`
      );
    }
  }
}

export default new BudgetAPI();
