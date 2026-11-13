
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
          setError(err.message);
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

  async function addHousing(housingItem) {
    const created = await HousingAPI.add(housingItem, tripId);

    setHousing((current) => [...current, created]);

    return created;
  }

  async function updateHousing(updatedHousing) {
    const updated = await HousingAPI.update(
      updatedHousing.id,
      updatedHousing,
      tripId
    );

    setHousing((current) =>
      current.map((housingItem) =>
        housingItem.id === updated.id ? updated : housingItem
      )
    );

    return updated;
  }

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
      }}
    >
      {children}
    </HousingContext.Provider>
  );
}

export function useHousing() {
  return useContext(HousingContext);
}
