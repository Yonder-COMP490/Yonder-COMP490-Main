/**
 * Class name: ActivityAPI
 * Date: 10/12/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving, creating, updating,
 * and deleting trip activities. Also supports switching an activity
 * between trip-day and fixed-date scheduling.
 */
const API_BASE = "http://localhost:8080/api/trips";

// Legacy endpoint retained for existing scheduling functionality.
const LEGACY_API_URL = "http://localhost:8080/api/trip";

function tripUrl(tripId) {
  const id = Number(tripId);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error("A valid trip ID is required.");
  }

  return `${API_BASE}/${id}`;
}

/**
 * Converts frontend activity data into the structure
 * expected by the Java backend.
 */
function serializeActivity(activity) {
  const description =
    activity.description &&
    typeof activity.description === "object"
      ? activity.description
      : {};

  const location = activity.location ?? {};

  return {
    id: activity.id ?? 0,

    description: {
      name: description.name ?? activity.name ?? "",
      description:
        description.description ??
        (typeof activity.description === "string"
          ? activity.description
          : ""),
      notes: description.notes ?? activity.notes ?? "",
      picture: description.picture ?? activity.picture ?? null,
    },

    location: {
      readableAddress:
        location.readableAddress ??
        activity.readableAddress ??
        null,
      latitude:
        location.latitude ??
        activity.latitude ??
        null,
      longitude:
        location.longitude ??
        activity.longitude ??
        null,
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
   * Retrieves activities belonging to a selected trip.
   */
  async getAll(tripId = 1) {
    const response = await fetch(tripUrl(tripId));

    if (!response.ok) {
      throw new Error(
        `Failed to load activities (${response.status}).`
      );
    }

    const trip = await response.json();
    return trip.activities ?? [];
  }

  /**
   * Adds an activity to a selected trip.
   */
  async add(activity, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/activities`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serializeActivity(activity)),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to add activity (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Updates an activity belonging to a selected trip.
   */
  async update(id, activity, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/activities/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...serializeActivity(activity),
          id,
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to update activity (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Deletes an activity from a selected trip.
   */
  async remove(id, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/activities/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to remove activity (${response.status}): ${details}`
      );
    }
  }

  /**
   * Changes an activity's scheduling mode.
   *
   * This legacy endpoint currently applies to the
   * original sample trip only.
   */
  async switchScheduleType(id, useFixedDate, tripId = 1) {
    if (Number(tripId) !== 1) {
      throw new Error(
        "Switching activity schedule types is not yet supported for additional trips."
      );
    }

    const response = await fetch(
      `${LEGACY_API_URL}/activities/${id}/schedule` +
        `?useFixedDate=${useFixedDate}`,
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

    return response.json();
  }
}

export default new ActivityAPI();
