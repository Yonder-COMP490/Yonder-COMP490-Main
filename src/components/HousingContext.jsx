import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import HousingAPI from "../api/HousingAPI";

const HousingContext = createContext();

export function HousingProvider({ children }) {
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function addHousing(housingItem) {
    const created = await HousingAPI.add(housingItem);
    setHousing((current) => [...current, created]);
    return created;
  }

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

export function useHousing() {
  return useContext(HousingContext);
}