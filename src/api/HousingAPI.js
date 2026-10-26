
const API_URL = "http://localhost:8080/api/trip";

function serializeHousing(housing) {
  const checkInDate = housing.checkInDate ?? null;
  const checkOutDate = housing.checkOutDate ?? null;

  const calculatedNights =
    checkInDate && checkOutDate
      ? Math.max(
          0,
          Math.round(
            (Date.parse(`${checkOutDate}T00:00:00Z`) -
              Date.parse(`${checkInDate}T00:00:00Z`)) /
              86400000
          )
        )
      : 0;

  return {
    id: housing.id ?? 0,
    name: housing.name,
    picture: housing.picture ?? null,
    active: housing.active ?? true,
    tripDay: housing.tripDay ?? null,
    checkInDate,
    checkInTime: housing.checkInTime ?? null,
    checkOutDate,
    checkOutTime: housing.checkOutTime ?? null,
    nights: housing.nights ?? calculatedNights,
    costPerDay: {
      lowerEnd: housing.costPerDay?.lowerEnd ?? 0,
      upperEnd:
        housing.costPerDay?.upperEnd ??
        housing.costPerDay?.lowerEnd ??
        0,
      currency: housing.costPerDay?.currency ?? "USD",
    },
    notes: housing.notes ?? "",
    readableAddress: housing.readableAddress ?? null,
    latitude: housing.latitude ?? null,
    longitude: housing.longitude ?? null,
  };
}

class HousingAPI {
  async getAll() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load housing bookings.");
    }

    const trip = await response.json();
    return trip.housingBookings ?? [];
  }

  async add(housing) {
    const response = await fetch(`${API_URL}/housing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializeHousing(housing)),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to add housing (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  async update(id, housing) {
    const response = await fetch(`${API_URL}/housing/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...serializeHousing(housing),
        id,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to update housing (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  async remove(id) {
    const response = await fetch(`${API_URL}/housing/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to remove housing.");
    }
  }
}

export default new HousingAPI();
