const API_URL = "http://localhost:8080/api/trip";

function serializeHousing(housing) {
  return {
    id: 0,
    name: housing.name,
    checkInDate: housing.checkInDate,
    checkInTime: housing.checkInTime,
    checkOutDate: housing.checkOutDate,
    checkOutTime: housing.checkOutTime,
    costPerDay: {
      lowerEnd: housing.costPerDay?.lowerEnd ?? 0,
      upperEnd:
        housing.costPerDay?.upperEnd ??
        housing.costPerDay?.lowerEnd ??
        0,
      currency: housing.costPerDay?.currency ?? "USD",
    },
    notes: housing.notes ?? "",
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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
      const details = await response.text();
      throw new Error(
        `Failed to remove housing (${response.status}): ${details}`
      );
    }
  }
}

export default new HousingAPI();