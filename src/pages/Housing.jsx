import { useState } from "react";
import { Link } from "react-router-dom";
import HousingCard from "../components/HousingCard";
import HousingForm from "../components/HousingForm";
import { useHousing } from "../components/HousingContext";
import "./Housing.css";

function Housing() {
  const { housing, addHousing, updateHousing } = useHousing();

  const [editingHousingId, setEditingHousingId] = useState(null);

  function handleSave(housingItem) {
    if (editingHousingId !== null) {
      updateHousing(housingItem);
      setEditingHousingId(null);
    } else {
      addHousing(housingItem);
    }
  }

  return (
    <div>
      <h1>Housing</h1>

      <div className="housing">
        {housing.map((housingItem) =>
          editingHousingId === housingItem.id ? (
            <HousingForm
              key={housingItem.id}
              housing={housingItem}
              onSave={handleSave}
              onCancel={() => setEditingHousingId(null)}
            />
          ) : (
            <HousingCard
              key={housingItem.id}
              housing={housingItem}
              onEdit={() => setEditingHousingId(housingItem.id)}
            />
          )
        )}

        <HousingForm onSave={handleSave} />
      </div>

      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Housing;