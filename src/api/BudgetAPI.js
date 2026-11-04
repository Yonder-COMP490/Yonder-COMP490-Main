
const API_URL = "http://localhost:8080/api/trip";

function serializeBudgetItem(item) {
  return {
    id: item.id ?? 0,
    name: item.name,
    cost: {
      lowerEnd: item.cost?.lowerEnd ?? 0,
      upperEnd: item.cost?.upperEnd ?? item.cost?.lowerEnd ?? 0,
      currency: item.cost?.currency ?? "USD",
    },
    days: item.days ?? 1,
  };
}

class BudgetAPI {
  async getSummary() {
    const response = await fetch(`${API_URL}/budget`);

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to load budget (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  async add(item) {
    const response = await fetch(`${API_URL}/budget-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serializeBudgetItem(item)),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to add budget item (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  async update(id, item) {
    const response = await fetch(`${API_URL}/budget-items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...serializeBudgetItem(item),
        id,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to update budget item (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  async remove(id) {
    const response = await fetch(`${API_URL}/budget-items/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to remove budget item (${response.status}): ${details}`
      );
    }
  }
}

export default new BudgetAPI();
