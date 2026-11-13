
import { useState } from "react";

const API_BASE = "http://localhost:8080/api";

export default function CreateTripForm({ onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a trip name.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }

    if (endDate < startDate) {
      setError("The end date must be on or after the start date.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          endDate,
          preferredCurrency: currency,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create trip (${response.status}).`);
      }

      const newTrip = await response.json();

      onCreated(newTrip);
    } catch (err) {
      setError(err.message || "Unable to create trip.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-trip-form">
      <h2>Create a New Trip</h2>

      <label htmlFor="trip-name">Trip Name</label>
      <input
        id="trip-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Italy Trip"
        required
      />

      <label htmlFor="trip-start">Start Date</label>
      <input
        id="trip-start"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        required
      />

      <label htmlFor="trip-end">End Date</label>
      <input
        id="trip-end"
        type="date"
        min={startDate || undefined}
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        required
      />

      <label htmlFor="trip-currency">Currency</label>
      <select
        id="trip-currency"
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
      >
        <option value="USD">USD - US Dollar</option>
        <option value="EUR">EUR - Euro</option>
        <option value="JPY">JPY - Japanese Yen</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="CAD">CAD - Canadian Dollar</option>
      </select>

      {error && <p role="alert">{error}</p>}

      <div className="create-trip-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Trip"}
        </button>
      </div>
    </form>
  );
}
