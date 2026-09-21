import { useState } from "react";

function ActivityForm({ activity, onSave, onCancel }) {
  const [name, setName] = useState(activity?.name || "");
  const [picture, setPicture] = useState(activity?.picture || "");
  const [date, setDate] = useState(activity?.date || "");
  const [startTime, setStartTime] = useState(activity?.startTime || "");
  const [endTime, setEndTime] = useState(activity?.endTime || "");
  const [cost, setCost] = useState(activity?.cost || "");
  const [notes, setNotes] = useState(activity?.notes || "");

  function handleSubmit(event) {
    event.preventDefault();

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
        type="text"
        placeholder="Cost"
        value={cost}
        onChange={(event) => setCost(event.target.value)}
      />

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