import { useState } from "react";

function HousingForm({ housing, onSave, onCancel }) {
  const [name, setName] = useState(housing?.name || "");

  const [checkInDate, setCheckInDate] = useState(
    housing?.checkInDate || ""
  );

  const [checkInTime, setCheckInTime] = useState(
    housing?.checkInTime || ""
  );

  const [checkOutDate, setCheckOutDate] = useState(
    housing?.checkOutDate || ""
  );

  const [checkOutTime, setCheckOutTime] = useState(
    housing?.checkOutTime || ""
  );

  const [costPerDay, setCostPerDay] = useState(
    housing?.costPerDay?.lowerEnd ?? 0
  );

  const [currency, setCurrency] = useState(
    housing?.costPerDay?.currency || "USD"
  );

  function handleSubmit(event) {
    event.preventDefault();

    const cost = {
      lowerEnd: Number(costPerDay) || 0,
      upperEnd: Number(costPerDay) || 0,
      currency,
    };

    onSave({
      ...(housing || {}),
      name,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      costPerDay: cost,
    });
  }

  return (
    <form className="housing-form" onSubmit={handleSubmit}>
      <h2>
        {housing ? "Edit Housing" : "Add Housing"}
      </h2>

      <input
        type="text"
        placeholder="Housing name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <label>
        Check-in date
      </label>

      <input
        type="date"
        value={checkInDate}
        onChange={(event) => setCheckInDate(event.target.value)}
        required
      />

      <label>
        Check-in time
      </label>

      <input
        type="time"
        value={checkInTime}
        onChange={(event) => setCheckInTime(event.target.value)}
      />

      <label>
        Check-out date
      </label>

      <input
        type="date"
        value={checkOutDate}
        onChange={(event) => setCheckOutDate(event.target.value)}
        required
      />

      <label>
        Check-out time
      </label>

      <input
        type="time"
        value={checkOutTime}
        onChange={(event) => setCheckOutTime(event.target.value)}
      />

      <input
        type="number"
        placeholder="Cost per day"
        min="0"
        step="0.01"
        value={costPerDay}
        onChange={(event) => setCostPerDay(event.target.value)}
        required
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

      <div>
        <button type="submit">
          Save
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default HousingForm;