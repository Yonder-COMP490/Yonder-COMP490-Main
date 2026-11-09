const API_URL = "http://localhost:8080/api/trip";

function serializeTrip(trip) {
  return {
    id: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    days: trip.days,
    preferredCurrency: trip.preferredCurrency,
  };
}

class TripAPI {
  async get() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load trip.");
    }

    return await response.json();
  }

  async update(trip) {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializeTrip(trip)),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to update trip (${response.status}): ${details}`
      );
    }

    return await response.json();
  }
}

export default new TripAPI();