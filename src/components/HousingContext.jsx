/**
 * Component name: HousingProvider
 * Date: 09/26/2026
 * Programmer: Ryan Sommerhauser
 * Description: Manages shared housing booking data throughout the application.
 * Provides housing state, loading and error information, and functions for
 * creating, updating, deleting, and refreshing housing bookings.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import HousingAPI from "../api/HousingAPI";

const HousingContext = createContext();
/**
 * Provides housing data and management functions to child components.
 *
 * Loads housing bookings from the backend when mounted and maintains
 * the shared housing state through React Context.
 *
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The child components receiving
 * access to the housing context.
 * @returns {JSX.Element} The HousingContext provider containing its children.
 */
export function HousingProvider({ children }) {
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /**
   * Retrieves the latest housing bookings from the backend and updates shared state.
   *
   * Clears the current error when successful and stores the error message
   * if the request fails.
   *
   * @returns {Promise<Array>} The refreshed list of housing bookings.
   * @throws {Error} If the request fails.
   */
  async function refreshHousing() {
    try {
      const data = await HousingAPI.getAll();
      setHousing(data);
      setError("");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  useEffect(() => {
    async function loadHousing() {
      try {
        setError("");
        await refreshHousing();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  /**
   * Creates a housing booking in the backend and adds it to shared state.
   *
   * @param {Object} housingItem - The housing booking to create.
   * @returns {Promise<Object>} The newly created housing booking.
   * @throws {Error} If the creation request fails.
   */
  async function addHousing(housingItem) {
    const created = await HousingAPI.add(housingItem);
    setHousing((current) => [...current, created]);
    return created;
  }

  /**
   * Updates an existing housing booking in the backend and replaces its entry
   * in the shared housing state.
   *
   * @param {Object} updatedHousing - The updated housing booking, including its ID.
   * @returns {Promise<Object>} The updated housing booking returned by the backend.
   * @throws {Error} If the update request fails.
   */
  async function updateHousing(updatedHousing) {
    const updated = await HousingAPI.update(
      updatedHousing.id,
      updatedHousing
    );

    setHousing((current) =>
      current.map((housingItem) =>
        housingItem.id === updated.id
          ? updated
          : housingItem
      )
    );

    return updated;
  }

  /**
   * Deletes a housing booking from the backend and removes it from shared state.
   *
   * @param {number} id - The ID of the housing booking to delete.
   * @returns {Promise<void>} A promise that resolves when deletion succeeds.
   * @throws {Error} If the deletion request fails.
   */
  async function removeHousing(id) {
    await HousingAPI.remove(id);

    setHousing((current) =>
      current.filter((housingItem) => housingItem.id !== id)
    );
  }

  return (
    <HousingContext.Provider
      value={{
        housing,
        loading,
        error,
        addHousing,
        updateHousing,
        removeHousing,
        refreshHousing,
      }}
    >
      {children}
    </HousingContext.Provider>
  );
}

/**
 * Provides access to the shared housing context.
 *
 * @returns {Object} The housing context containing booking data,
 * loading and error states, and housing management functions.
 */
export function useHousing() {
  return useContext(HousingContext);
}