import { createContext, useContext, useState } from "react";
import Cost from "../components/Cost";

const HousingContext = createContext();

export function HousingProvider({ children }) {
  const [housing, setHousing] = useState([
    {
      id: 1,
      name: "Kyoto Ryokan",
      checkInDate: "2026-10-14",
      checkInTime: "15:00",
      checkOutDate: "2026-10-16",
      checkOutTime: "10:00",
      costPerDay: new Cost(120, 120, "USD"),
    },
    {
      id: 2,
      name: "Osaka Hotel",
      checkInDate: "2026-10-16",
      checkInTime: "15:00",
      checkOutDate: "2026-10-18",
      checkOutTime: "11:00",
      costPerDay: new Cost(150, 150, "USD"),
    },
  ]);

  function addHousing(housingItem) {
    setHousing([
      ...housing,
      {
        id: crypto.randomUUID(),
        ...housingItem,
      },
    ]);
  }

  function updateHousing(updatedHousing) {
    setHousing(
      housing.map((housingItem) =>
        housingItem.id === updatedHousing.id
          ? updatedHousing
          : housingItem
      )
    );
  }

  return (
    <HousingContext.Provider
      value={{
        housing,
        addHousing,
        updateHousing,
      }}
    >
      {children}
    </HousingContext.Provider>
  );
}

export function useHousing() {
  return useContext(HousingContext);
}