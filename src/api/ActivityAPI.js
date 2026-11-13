/**
 * Class name: ActivityAPI
 * Date: 10/12/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving, creating, updating,
 * and deleting trip activities. Also supports switching an activity
 * between trip-day and fixed-date scheduling.
 */
const API_URL = "http://localhost:8080/api/trip";

/**
 * Converts an activity object into the format expected by the backend.
 *
 * Handles nested description and location objects, scheduling information,
 * and cost values. Supplies defaults for missing optional properties.
 *
 * @param {Object} activity - The activity to serialize.
 * @returns {Object} The formatted activity data.
 */
function serializeActivity(activity) {
  const description = activity.description ?? {};
  const location = activity.location ?? {};

  return {
    id: activity.id ?? 0,

    description: {
      name: description.name ?? activity.name ?? "",
      description:
        description.description ??
        (typeof activity.description === "string" ? activity.description : ""),
      notes: description.notes ?? activity.notes ?? "",
      picture: description.picture ?? activity.picture ?? null,
    },

    location: {
      readableAddress:
        location.readableAddress ?? activity.readableAddress ?? null,
      latitude: location.latitude ?? activity.latitude ?? null,
      longitude: location.longitude ?? activity.longitude ?? null,
    },

    active: activity.active ?? true,
    tripDay: activity.tripDay ?? null,
    date: activity.date ?? null,

    startTime: activity.startTime ?? null,
    endTime: activity.endTime ?? null,

    cost: {
      lowerEnd: activity.cost?.lowerEnd ?? 0,
      upperEnd:
        activity.cost?.upperEnd ??
        activity.cost?.lowerEnd ??
        0,
      currency: activity.cost?.currency ?? "USD",
    },
  };
}

class ActivityAPI {
  /**
   * Retrieves all activities associated with the current trip.
   *
   * @returns {Promise<Array>} A promise containing the trip activities.
   * @throws {Error} If the request fails.
   */
  async getAll() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load trip activities.");
    }

    const trip = await response.json();
    return trip.activities ?? [];
  }

  /**
   * Creates a new activity in the backend.
   *
   * Serializes the supplied activity before sending it.
   *
   * @param {Object} activity - The activity to create.
   * @returns {Promise<Object>} A promise containing the created activity.
   * @throws {Error} If the creation request fails.
   */
  async add(activity) {
    const response = await fetch(`${API_URL}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializeActivity(activity)),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to add activity (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  /**
   * Updates an existing activity.
   *
   * @param {number} id - The ID of the activity to update.
   * @param {Object} activity - The updated activity data.
   * @returns {Promise<Object>} A promise containing the updated activity.
   * @throws {Error} If the update request fails.
   */
  async update(id, activity) {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...serializeActivity(activity),
        id,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to update activity (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  /**
   * Deletes an activity from the backend.
   *
   * @param {number} id - The ID of the activity to delete.
   * @returns {Promise<void>} A promise that resolves when deletion succeeds.
   * @throws {Error} If the deletion request fails.
   */
  async remove(id) {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to remove activity.");
    }
  }

  /**
   * Switches an activity between trip-day and fixed-date scheduling.
   *
   * The backend preserves the activity's effective date while changing
   * its scheduling type.
   *
   * @param {number} id - The ID of the activity to modify.
   * @param {boolean} useFixedDate - Whether the activity should use a fixed date.
   * @returns {Promise<Object>} A promise containing the updated activity.
   * @throws {Error} If the schedule cannot be switched.
   */
  async switchScheduleType(id, useFixedDate) {
    const response = await fetch(
      `${API_URL}/activities/${id}/schedule?useFixedDate=${useFixedDate}`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to switch activity schedule (${response.status}): ${details}`
      );
    }

    return await response.json();
  }
}

export default new ActivityAPI();