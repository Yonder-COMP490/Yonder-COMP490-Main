import { useState } from "react";
import Cost from "../components/Cost";

function ActivityForm({ activity, onSave, onCancel }) {
  const [name, setName] = useState(activity?.name || "");
  const [picture, setPicture] = useState(activity?.picture || "");
  const [date, setDate] = useState(activity?.date || "");
  const [startTime, setStartTime] = useState(activity?.startTime || "");
  const [endTime, setEndTime] = useState(activity?.endTime || "");

  const [lowerEnd, setLowerEnd] = useState(
    activity?.cost?.lowerEnd ?? 0
  );

  const [upperEnd, setUpperEnd] = useState(
    activity?.cost?.upperEnd ?? 0
  );

  const [currency, setCurrency] = useState(
    activity?.cost?.currency || "USD"
  );

  const [notes, setNotes] = useState(activity?.notes || "");

  function handleSubmit(event) {
    event.preventDefault();

    const cost = new Cost(
      Number(lowerEnd) || 0,
      Number(upperEnd) || 0,
      currency
    );

    onSave({
      ...(activity || {}),
      name,
      picture,
      date,
      startTime,
      endTime,
      cost,
      notes,
    });
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>{activity ? "Edit Activity" : "Add Activity"}</h2>

      <input
        type="text"
        placeholder="Activity name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <input
        type="text"
        placeholder="Picture URL"
        value={picture}
        onChange={(event) => setPicture(event.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />

      <input
        type="time"
        value={startTime}
        onChange={(event) => setStartTime(event.target.value)}
      />

      <input
        type="time"
        value={endTime}
        onChange={(event) => setEndTime(event.target.value)}
      />

      <input
        type="number"
        placeholder="Minimum cost"
        value={lowerEnd}
        onChange={(event) => setLowerEnd(event.target.value)}
      />

      <input
        type="number"
        placeholder="Maximum cost"
        value={upperEnd}
        onChange={(event) => setUpperEnd(event.target.value)}
      />

      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
      >
        <option value="USD">USD</option>
        <option value="JPY">JPY</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <div>
        <button type="submit">
          Save
        </button>

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