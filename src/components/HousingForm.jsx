
import { useState } from "react";

function HousingForm({ housing, onSave, onCancel }) {
  const [name, setName] = useState(housing?.name || "");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (housing) {
      onSave({
        ...housing,
        name: trimmedName,
      });
    } else {
      onSave({
        name: trimmedName,
      });
    }
  }

  return (
    <form className="housing-form" onSubmit={handleSubmit}>
      <h2>{housing ? "Edit Housing Name" : "Add Housing"}</h2>

      <input
        type="text"
        placeholder="Housing name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        required
      />

      <div>
        <button type="submit">Save</button>

        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default HousingForm;
