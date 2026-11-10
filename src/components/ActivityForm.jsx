
import { useState } from "react";

function ActivityForm({ activity, onSave, onCancel }) {
  const [name, setName] = useState(activity?.name || "");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (activity) {
      onSave({
        ...activity,
        name: trimmedName,
      });
    } else {
      onSave({
        name: trimmedName,
      });
    }
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>{activity ? "Edit Activity Name" : "Add Activity"}</h2>

      <input
        type="text"
        placeholder="Activity name"
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

export default ActivityForm;
