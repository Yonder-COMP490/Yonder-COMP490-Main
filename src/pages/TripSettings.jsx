import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import TripAPI from "../api/TripAPI";
import "./TripSettings.css";

const CURRENCIES = [
  ["USD", "US Dollar ($)"],
  ["EUR", "Euro (€)"],
  ["JPY", "Japanese Yen (¥)"],
  ["GBP", "British Pound (£)"],
  ["CAD", "Canadian Dollar (C$)"],
];

function endDateFromTrip(startDate, days) {
  if (!startDate || !days) return "";
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days - 1));
  return date.toISOString().slice(0, 10);
}

function daysInclusive(startDate, endDate) {
  const toUTC = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(endDate) - toUTC(startDate)) / 86400000) + 1;
}

function valuesFromTrip(trip) {
  return {
    name: trip?.name ?? "",
    location: trip?.location ?? "",
    startDate: trip?.startDate ?? "",
    endDate: endDateFromTrip(trip?.startDate, trip?.days),
    numberOfTravelers: String(trip?.numberOfTravelers ?? 1),
    targetBudget: String(trip?.targetBudget ?? 0),
    preferredCurrency: trip?.preferredCurrency ?? "USD",
  };
}

/** Allows editing settings for the selected trip and deleting that trip. */
export default function TripSettings() {
  const { trip, setTrip } = useOutletContext();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => valuesFromTrip(trip));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setForm(valuesFromTrip(trip));
    setError("");
    setNotice("");
  }, [trip?.id]);

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setNotice("");
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!trip || saving || deleting) return;

    const name = form.name.trim();
    const location = form.location.trim();
    const travelers = Number(form.numberOfTravelers);
    const budget = Number(form.targetBudget);
    const days = daysInclusive(form.startDate, form.endDate);

    if (!name || !location) {
      setError("Trip name and location are required.");
      return;
    }
    if (!form.startDate || !form.endDate || !Number.isFinite(days) || days < 1) {
      setError("The end date must be on or after the start date.");
      return;
    }
    if (!Number.isInteger(travelers) || travelers < 1) {
      setError("Number of travelers must be at least 1.");
      return;
    }
    if (!Number.isFinite(budget) || budget < 0) {
      setError("Target budget must be 0 or greater.");
      return;
    }
    if ((trip.tripSections?.length ?? 1) > days) {
      setError("Trip duration cannot be shorter than its number of calendar sections.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await TripAPI.update({
        ...trip,
        name,
        location,
        startDate: form.startDate,
        days,
        numberOfTravelers: travelers,
        targetBudget: budget,
        preferredCurrency: form.preferredCurrency,
      });
      setTrip(updated);
      setForm(valuesFromTrip(updated));
      setNotice("Trip settings saved.");
    } catch (err) {
      setError(err.message || "Unable to save trip settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!trip || deleting || saving || trip.id === 1) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete your "${trip.name}" trip? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await TripAPI.delete(trip.id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to delete trip.");
      setDeleting(false);
    }
  }

  const currencyOptions = CURRENCIES.some(([code]) => code === form.preferredCurrency)
    ? CURRENCIES
    : [[form.preferredCurrency, form.preferredCurrency], ...CURRENCIES];

  return (
    <section className="trip-settings">
      <h1 className="trip-settings-title">Trip Settings</h1>
      <p className="trip-settings-description">Manage your trip details.</p>

      <form className="trip-settings-form" onSubmit={handleSave}>
        <label htmlFor="settings-name">Trip Name</label>
        <input id="settings-name" value={form.name}
          onChange={(e) => updateField("name", e.target.value)} required />

        <label htmlFor="settings-location">Location</label>
        <input id="settings-location" value={form.location}
          placeholder="e.g. Rome, Italy"
          onChange={(e) => updateField("location", e.target.value)} required />

        <div className="trip-settings-columns">
          <div>
            <label htmlFor="settings-start">Start Date</label>
            <input id="settings-start" type="date" value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)} required />
          </div>
          <div>
            <label htmlFor="settings-end">End Date</label>
            <input id="settings-end" type="date" min={form.startDate || undefined}
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)} required />
          </div>
          <div>
            <label htmlFor="settings-travelers">Number of Travelers</label>
            <input id="settings-travelers" type="number" min="1" step="1"
              value={form.numberOfTravelers}
              onChange={(e) => updateField("numberOfTravelers", e.target.value)} required />
          </div>
          <div>
            <label htmlFor="settings-budget">Target Budget</label>
            <input id="settings-budget" type="number" min="0" step="0.01"
              value={form.targetBudget}
              onChange={(e) => updateField("targetBudget", e.target.value)} required />
          </div>
        </div>

        <label htmlFor="settings-currency">Preferred Currency</label>
        <select id="settings-currency" value={form.preferredCurrency}
          onChange={(e) => updateField("preferredCurrency", e.target.value)}>
          {currencyOptions.map(([code, label]) => (
            <option key={code} value={code}>{code} — {label}</option>
          ))}
        </select>

        <div className="trip-settings-coming-soon">
          <label>Trip Cover Photo</label>
          <div aria-disabled="true">Coming soon</div>
        </div>
        <div className="trip-settings-coming-soon">
          <label>Share / Invite to Trip</label>
          <div aria-disabled="true">Coming soon</div>
        </div>

        {error && <p role="alert" className="trip-settings-error">{error}</p>}
        {notice && <p role="status" className="trip-settings-success">{notice}</p>}
        <div className="trip-settings-save-row">
          <button type="submit" disabled={saving || deleting}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="trip-settings-delete-area">
        {trip?.id === 1 && (
          <p className="trip-settings-protected">The sample Japan trip cannot be deleted yet.</p>
        )}
        <button type="button" className="trip-settings-delete-button"
          onClick={handleDelete} disabled={saving || deleting || trip?.id === 1}>
          {deleting ? "Deleting..." : "Delete Trip"}
        </button>
      </div>
    </section>
  );
}
