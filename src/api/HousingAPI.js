
const API_URL = "http://localhost:8080/api/trip";

function serializeHousing(housing) {
  const description =
    housing.description && typeof housing.description === "object"
      ? housing.description
      : {};

  const location = housing.location ?? {};

  const tripSectionId = housing.tripSectionId ?? null;
  const usesTripSection = tripSectionId !== null;

  const fixedCheckInDate = usesTripSection
    ? null
    : housing.fixedCheckInDate ?? housing.checkInDate ?? null;

  const checkOutDate = housing.checkOutDate ?? null;

  const calculatedNights =
    fixedCheckInDate && checkOutDate
      ? Math.max(
          0,
          Math.round(
            (Date.parse(`${checkOutDate}T00:00:00Z`) -
              Date.parse(`${fixedCheckInDate}T00:00:00Z`)) /
              86400000
          )
        )
      : 0;

  return {
    id: housing.id ?? 0,

    description: {
      name: description.name ?? housing.name ?? "",
      description:
        description.description ??
        (typeof housing.description === "string"
          ? housing.description
          : ""),
      notes: description.notes ?? housing.notes ?? "",
      picture: description.picture ?? housing.picture ?? null,
    },

    location: {
      readableAddress:
        location.readableAddress ?? housing.readableAddress ?? null,
      latitude: location.latitude ?? housing.latitude ?? null,
      longitude: location.longitude ?? housing.longitude ?? null,
    },

    active: housing.active ?? true,

    tripSectionId,
    fixedCheckInDate,

    checkInTime: housing.checkInTime ?? null,
    checkOutTime: housing.checkOutTime ?? null,

    // Only fixed-date bookings store their own nights.
    ...(usesTripSection
      ? {}
      : {
          nights: housing.nights ?? calculatedNights,
        }),

    costPerDay: {
      lowerEnd: housing.costPerDay?.lowerEnd ?? 0,
      upperEnd:
        housing.costPerDay?.upperEnd ??
        housing.costPerDay?.lowerEnd ??
        0,
      currency: housing.costPerDay?.currency ?? "USD",
    },
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
      throw new Error("Failed to remove housing.");
    }
  }
}

export default new HousingAPI();
