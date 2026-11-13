/**
 * Component name: Housing
 * Date: 09/26/2026
 * Programmer: Ryan Sommerhauser
 * Description: Displays housing bookings for the current trip and provides
 * functionality for adding and updating housing bookings.
 */
import { Link, useOutletContext } from "react-router-dom";

import HousingCard from "../components/HousingCard";
import HousingForm from "../components/HousingForm";
import { useHousing } from "../components/HousingContext";

import "./Housing.css";

/**
 * Displays the housing page using shared housing data from HousingContext.
 *
 * Retrieves the current trip's sections and passes them to each HousingCard
 * so bookings can be assigned to trip sections. Also renders a HousingForm
 * for adding new housing bookings.
 *
 * @returns {JSX.Element} The housing page.
 */
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
