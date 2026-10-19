
const API_URL = "http://localhost:8080/api/trip";

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
    const activityData = {
        name: activity.name,
        picture: activity.picture,
        date: activity.date,
        startTime: activity.startTime,
        endTime: activity.endTime,
        cost: activity.cost,
        notes: activity.notes,
        latitude: activity.latitude ?? null,
        longitude: activity.longitude ?? null,
    };

    const response = await fetch(`${API_URL}/activities`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(activityData),
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      throw new Error("Failed to update activity.");
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
}

export default new ActivityAPI();
