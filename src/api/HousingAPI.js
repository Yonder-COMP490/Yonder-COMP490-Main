/**
 * Class name: HousingAPI
 * Date: 10/14/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving, creating, updating,
 * and deleting housing bookings. Serializes housing data to match the
 * backend model and supports both trip-section and fixed-date scheduling.
 */
const API_URL = "http://localhost:8080/api/trip";

/**
 * Converts a housing booking into the format expected by the backend.
 *
 * Handles nested description and location objects, determines the
 * appropriate scheduling fields, calculates nights for fixed-date
 * bookings when necessary, and supplies default cost values.
 *
 * @param {Object} housing - The housing booking to serialize.
 * @returns {Object} The formatted housing booking data.
 */
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
  /**
   * Retrieves all housing bookings associated with the current trip.
   *
   * @returns {Promise<Array>} A promise containing the housing bookings.
   * @throws {Error} If the request fails.
   */
  async getAll() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load housing bookings.");
    }

    const trip = await response.json();
    return trip.housingBookings ?? [];
  }

  /**
   * Creates a new housing booking in the backend.
   *
   * Serializes the supplied booking before sending it.
   *
   * @param {Object} housing - The housing booking to create.
   * @returns {Promise<Object>} A promise containing the created booking.
   * @throws {Error} If the creation request fails.
   */
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

  /**
   * Updates an existing housing booking.
   *
   * Uses the supplied ID to identify the booking and serializes
   * the updated booking data before sending it.
   *
   * @param {number} id - The ID of the housing booking to update.
   * @param {Object} housing - The updated housing booking data.
   * @returns {Promise<Object>} A promise containing the updated booking.
   * @throws {Error} If the update request fails.
   */
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

  /**
   * Deletes a housing booking from the backend.
   *
   * @param {number} id - The ID of the housing booking to delete.
   * @returns {Promise<void>} A promise that resolves when deletion succeeds.
   * @throws {Error} If the deletion request fails.
   */
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
