
/**
 * Class name: TripAPI
 * Date: 11/6/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving and updating
 * trips. Serializes trip data, including trip sections, before
 * sending updates to the backend.
 */

const API_URL = "http://localhost:8080/api/trip";
const TRIPS_API_URL = "http://localhost:8080/api/trips";

/**
 * Converts a trip object into the format expected by the backend.
 *
 * Includes the trip's basic information and its associated trip
 * sections. Missing section coordinates are converted to null.
 *
 * @param {Object} trip - The trip object to serialize.
 * @returns {Object} The formatted trip data.
 */
function serializeTrip(trip) {
  return {
    id: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    days: trip.days,
    preferredCurrency: trip.preferredCurrency,
    location: trip.location ?? "",
    numberOfTravelers: trip.numberOfTravelers ?? 1,
    targetBudget: trip.targetBudget ?? 0,

    tripSections: (trip.tripSections ?? []).map((section) => ({
      id: section.id,
      name: section.name,
      days: section.days,
      hexColor: section.hexColor,
      latitude: section.latitude ?? null,
      longitude: section.longitude ?? null,
    })),
  };
}

class TripAPI {
  /**
   * Retrieves the original sample trip from the backend.
   *
   * @returns {Promise<Object>} A promise containing the trip data.
   * @throws {Error} If the request fails.
   */
  async get() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load trip.");
    }

    return await response.json();
  }

  /**
   * Updates the selected trip using its unique identifier.
   *
   * Serializes the supplied trip before sending it to the
   * trip-specific backend endpoint.
   *
   * @param {Object} trip - The updated trip information.
   * @returns {Promise<Object>} A promise containing the updated trip.
   * @throws {Error} If the trip ID is missing or the request fails.
   */
  async update(trip) {
    if (!Number.isInteger(trip?.id)) {
      throw new Error("A valid trip ID is required.");
    }

    const response = await fetch(
      `${TRIPS_API_URL}/${trip.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serializeTrip(trip)),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to update trip (${response.status}): ${details}`
      );
    }

    return await response.json();
  }

  /**
   * Deletes the selected trip by ID.
   *
   * @param {number} tripId - ID of the trip to delete.
   * @returns {Promise<void>}
   */
  async delete(tripId) {
    if (!Number.isInteger(tripId) || tripId <= 0) {
      throw new Error("Invalid trip ID.");
    }

    const response = await fetch(
      `http://localhost:8080/api/trips/${tripId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Failed to delete trip: ${details}`);
    }
  }
}

export default new TripAPI();
