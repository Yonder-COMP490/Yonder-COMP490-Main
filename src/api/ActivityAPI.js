
const API_BASE = "http://localhost:8080/api/trips";

function tripUrl(tripId) {
  if (!Number.isInteger(tripId) || tripId < 1) {
    throw new Error("A valid trip ID is required.");
  }

  return `${API_BASE}/${tripId}`;
}

function serializeActivity(activity) {
  return {
    id: activity.id ?? 0,
    name: activity.name,
    picture: activity.picture ?? null,
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
    notes: activity.notes ?? "",
    readableAddress: activity.readableAddress ?? null,
    latitude: activity.latitude ?? null,
    longitude: activity.longitude ?? null,
  };
}

class ActivityAPI {
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

  async add(activity, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/activities`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  async update(id, activity, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/activities/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  async remove(id, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/activities/${id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to remove activity (${response.status}).`
      );
    }
  }
}

export default new ActivityAPI();
