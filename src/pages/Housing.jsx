
import { Link, useOutletContext } from "react-router-dom";

import HousingCard from "../components/HousingCard";
import HousingForm from "../components/HousingForm";
import { useHousing } from "../components/HousingContext";

import "./Housing.css";

function Housing() {
  const { housing, addHousing, updateHousing } = useHousing();
  const { trip } = useOutletContext();

  const tripSections = trip?.tripSections ?? [];

  return (
    <div>
      <h1>Housing</h1>

      <div className="housing">
        {housing.map((housingItem) => (
          <HousingCard
            key={housingItem.id}
            housing={housingItem}
            tripSections={tripSections}
            onSave={updateHousing}
          />
        ))}

        <HousingForm onSave={addHousing} />
      </div>

      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Housing;
