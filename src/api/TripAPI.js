/**
 * Class name: TripAPI
 * Date: 11/6/2026
 * Programmer: Ryan Sommerhauser
 * Description: Handles API requests for retrieving and updating the
 * current trip. Serializes trip data, including its trip sections,
 * before sending updates to the backend.
 */
const API_URL = "http://localhost:8080/api/trip";

/**
 * Converts a trip object into the format expected by the backend.
 *
 * Includes the trip's basic information and its associated trip sections.
 * Missing section coordinates are converted to null.
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
 * Retrieves the current trip from the backend.
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
   * Updates the current trip in the backend.
   *
   * Serializes the supplied trip before sending it.
   *
   * @param {Object} trip - The updated trip information.
   * @returns {Promise<Object>} A promise containing the updated trip.
   * @throws {Error} If the update request fails.
   */
  async update(trip) {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
