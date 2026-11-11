const API_URL = "http://localhost:8080/api/trip";

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
  async getAll() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load trip activities.");
    }

    const trip = await response.json();
    return trip.activities ?? [];
  }

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

  async remove(id) {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to remove activity.");
    }
  }

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