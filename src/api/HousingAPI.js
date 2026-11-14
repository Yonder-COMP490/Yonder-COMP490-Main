/**
 * Class name: HousingAPI
 * Date: 10/14/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving, creating, updating,
 * and deleting housing bookings. Serializes housing data to match the
 * backend model and supports both trip-section and fixed-date scheduling.
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
 * Converts frontend housing data into the structure
 * expected by the updated Java HousingBooking model.
 */
function serializeHousing(housing) {
  const description =
    housing.description &&
    typeof housing.description === "object"
      ? housing.description
      : {};

  const location = housing.location ?? {};

  const tripSectionId = housing.tripSectionId ?? null;
  const usesTripSection = tripSectionId !== null;

  const fixedCheckInDate = usesTripSection
    ? null
    : housing.fixedCheckInDate ??
      housing.checkInDate ??
      null;

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
      picture:
        description.picture ??
        housing.picture ??
        null,
    },

    location: {
      readableAddress:
        location.readableAddress ??
        housing.readableAddress ??
        null,
      latitude:
        location.latitude ??
        housing.latitude ??
        null,
      longitude:
        location.longitude ??
        housing.longitude ??
        null,
    },

    active: housing.active ?? true,

    tripSectionId,
    fixedCheckInDate,

    checkInTime: housing.checkInTime ?? null,
    checkOutTime: housing.checkOutTime ?? null,

    // Fixed-date bookings store their own duration.
    // Section-based bookings calculate their duration
    // from the assigned TripSection.
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
  /**
   * Retrieves housing bookings for a selected trip.
   */
  async getAll(tripId = 1) {
    const response = await fetch(tripUrl(tripId));

    if (!response.ok) {
      throw new Error(
        `Failed to load housing bookings (${response.status}).`
      );
    }

    const trip = await response.json();
    return trip.housingBookings ?? [];
  }

  /**
   * Adds a housing booking to a selected trip.
   */
  async add(housing, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/housing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serializeHousing(housing)),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to add housing (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Updates a housing booking in a selected trip.
   */
  async update(id, housing, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/housing/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...serializeHousing(housing),
          id,
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to update housing (${response.status}): ${details}`
      );
    }

    return response.json();
  }

  /**
   * Deletes a housing booking from a selected trip.
   */
  async remove(id, tripId = 1) {
    const response = await fetch(
      `${tripUrl(tripId)}/housing/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to remove housing (${response.status}).`
      );
    }
  }
}

export default new HousingAPI();
