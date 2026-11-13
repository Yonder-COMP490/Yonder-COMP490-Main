/**
 * Class name: BudgetAPI
 * Date: 10/23/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving budget summaries
 * and creating, updating, and deleting individual budget items.
 * Serializes budget item data before sending it to the backend.
 */
const API_URL = "http://localhost:8080/api/trip";

/**
 * Converts a budget item into the format expected by the backend.
 *
 * Supplies default values for missing IDs, costs, currencies,
 * and durations.
 *
 * @param {Object} item - The budget item to serialize.
 * @returns {Object} The formatted budget item data.
 */
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
  /**
   * Retrieves the calculated budget summary for the current trip.
   *
   * The summary includes category totals, the overall trip cost,
   * and individual budget entries.
   *
   * @returns {Promise<Object>} A promise containing the budget summary.
   * @throws {Error} If the request fails.
   */
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

  /**
   * Creates a new daily budget item in the backend.
   *
   * Serializes the supplied item before sending it.
   *
   * @param {Object} item - The budget item to create.
   * @returns {Promise<Object>} A promise containing the created budget item.
   * @throws {Error} If the creation request fails.
   */
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

  /**
   * Updates an existing daily budget item.
   *
   * @param {number} id - The ID of the budget item to update.
   * @param {Object} item - The updated budget item data.
   * @returns {Promise<Object>} A promise containing the updated budget item.
   * @throws {Error} If the update request fails.
   */
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

  /**
   * Deletes a daily budget item from the backend.
   *
   * @param {number} id - The ID of the budget item to delete.
   * @returns {Promise<void>} A promise that resolves when deletion succeeds.
   * @throws {Error} If the deletion request fails.
   */
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
