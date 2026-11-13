/**
 * Class name: BudgetAPI
 * Date: 10/23/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving budget summaries
 * and creating, updating, and deleting individual budget items.
 * Serializes budget item data before sending it to the backend.
 */
const API_BASE = "http://localhost:8080/api/trips";

function tripUrl(tripId) {
  const id = Number(tripId);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error("A valid trip ID is required.");
  }

  return `${API_BASE}/${id}`;
}

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
   * Retrieves the calculated budget summary for the current trip.
   *
   * The summary includes category totals, the overall trip cost,
   * and individual budget entries.
   *
   * @returns {Promise<Object>} A promise containing the budget summary.
   * @throws {Error} If the request fails.
   */
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
   * Creates a new daily budget item in the backend.
   *
   * Serializes the supplied item before sending it.
   *
   * @param {Object} item - The budget item to create.
   * @returns {Promise<Object>} A promise containing the created budget item.
   * @throws {Error} If the creation request fails.
   */
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
   * Updates an existing daily budget item.
   *
   * @param {number} id - The ID of the budget item to update.
   * @param {Object} item - The updated budget item data.
   * @returns {Promise<Object>} A promise containing the updated budget item.
   * @throws {Error} If the update request fails.
   */
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
   * Deletes a daily budget item from the backend.
   *
   * @param {number} id - The ID of the budget item to delete.
   * @returns {Promise<void>} A promise that resolves when deletion succeeds.
   * @throws {Error} If the deletion request fails.
   */
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
