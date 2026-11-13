
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import HousingAPI from "../api/HousingAPI";

const HousingContext = createContext();

export function HousingProvider({ children, tripId = 1 }) {
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Reloads housing bookings for the selected trip.
   */
  async function refreshHousing() {
    try {
      const data = await HousingAPI.getAll(tripId);

      setHousing(data);
      setError("");

      return data;
    } catch (err) {
      setError(
        err.message || "Failed to load housing bookings."
      );
      throw err;
    }
  }

  /**
   * Loads the selected trip's housing when the trip changes.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadHousing() {
      setLoading(true);
      setHousing([]);
      setError("");

      try {
        const data = await HousingAPI.getAll(tripId);

        if (!cancelled) {
          setHousing(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to load housing bookings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHousing();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  /**
   * Adds a housing booking to the selected trip.
   */
  async function addHousing(housingItem) {
    const created = await HousingAPI.add(
      housingItem,
      tripId
    );

    setHousing((current) => [
      ...current,
      created,
    ]);

    return created;
  }

  /**
   * Updates a booking belonging to the selected trip.
   */
  async function updateHousing(updatedHousing) {
    const updated = await HousingAPI.update(
      updatedHousing.id,
      updatedHousing,
      tripId
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
   * Removes a housing booking from the selected trip.
   */
  async function removeHousing(id) {
    await HousingAPI.remove(id, tripId);

    setHousing((current) =>
      current.filter((housingItem) => housingItem.id !== id)
    );
  }

  return (
    <HousingContext.Provider
      value={{
        tripId,
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

export function useHousing() {
  return useContext(HousingContext);
}
