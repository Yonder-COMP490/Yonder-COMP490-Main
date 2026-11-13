/**
 * Component name: HousingCard
 * Date: 09/26/2026
 * Programmer: Ryan Sommerhauser
 * Description: Displays and manages a housing booking, including its name,
 * description, schedule, check-in and check-out times, cost, and notes.
 */
import { useEffect, useState } from "react";
import "./HousingCard.css";

/**
 * Formats a cost range into a readable string.
 *
 * @param {Object|null} cost - The cost object containing lower and upper amounts.
 * @returns {string} The formatted cost range, or an empty string if no cost exists.
 */
function formatCostAmount(cost) {
  if (!cost) return "";

  const lower = Number(cost.lowerEnd ?? 0);
  const upper = Number(cost.upperEnd ?? lower);

  return lower === upper ? `${lower}` : `${lower}-${upper}`;
}

/**
 * Calculates the number of nights between two dates.
 *
 * @param {string} checkInDate - The check-in date.
 * @param {string} checkOutDate - The check-out date.
 * @returns {number} The number of nights between the dates.
 */
function calculateNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 0;

  const checkIn = Date.parse(`${checkInDate}T00:00:00Z`);
  const checkOut = Date.parse(`${checkOutDate}T00:00:00Z`);

  return Math.max(0, Math.round((checkOut - checkIn) / 86400000));
}

/**
 * Formats a date for display by removing the year.
 *
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {string} The formatted date or "Not set".
 */
function formatDate(date) {
  if (!date || date === "Not set") return "Not set";

  const [, month, day] = date.match(/^(\d{4})-(\d{2})-(\d{2})$/) || [];

  return month && day ? `${month}-${day}` : date;
}

/**
 * Converts a 24-hour time into a 12-hour time with AM/PM.
 *
 * @param {string} time - The time in HH:mm format.
 * @returns {string} The formatted time or "Not set".
 */
function formatTime(time) {
  if (!time) return "Not set";

  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/**
 * Displays a housing booking and provides controls for editing its details.
 *
 * Maintains local editing state and saves changes through the provided
 * callback.
 *
 * @param {Object} props - The component properties.
 * @param {Object} props.housing - The housing booking being displayed.
 * @param {Array<Object>} props.tripSections - The available trip sections.
 * @param {Function} props.onSave - Callback used to save housing changes.
 * @returns {JSX.Element} The housing booking card.
 */
function HousingCard({ housing, tripSections = [], onSave }) {
  const description = housing.description ?? {};

  const [expanded, setExpanded] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [name, setName] = useState(description.name ?? "");
  const [housingDescription, setHousingDescription] = useState(
    description.description ?? ""
  );
  const [notes, setNotes] = useState(description.notes ?? "");

  const [costAmount, setCostAmount] = useState(
    formatCostAmount(housing.costPerDay)
  );
  const [currency, setCurrency] = useState(
    housing.costPerDay?.currency ?? "USD"
  );

  const [fixedCheckInDate, setFixedCheckInDate] = useState(
    housing.fixedCheckInDate ?? housing.checkInDate ?? ""
  );
  const [nights, setNights] = useState(
    housing.nights ??
      calculateNights(housing.checkInDate, housing.checkOutDate)
  );

  const [checkInTime, setCheckInTime] = useState(
    housing.checkInTime ?? ""
  );
  const [checkOutTime, setCheckOutTime] = useState(
    housing.checkOutTime ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentDescription = housing.description ?? {};

    setName(currentDescription.name ?? "");
    setHousingDescription(currentDescription.description ?? "");
    setNotes(currentDescription.notes ?? "");

    setCostAmount(formatCostAmount(housing.costPerDay));
    setCurrency(housing.costPerDay?.currency ?? "USD");

    setFixedCheckInDate(
      housing.fixedCheckInDate ?? housing.checkInDate ?? ""
    );

    setNights(
      housing.nights ??
        calculateNights(housing.checkInDate, housing.checkOutDate)
    );

    setCheckInTime(housing.checkInTime ?? "");
    setCheckOutTime(housing.checkOutTime ?? "");
  }, [housing]);

  /**
   * Saves changes to the housing booking and manages saving and error states.
   *
   * @param {Object} changes - The housing properties to update.
   * @returns {Promise<boolean>} Whether the save operation succeeded.
   */
  async function saveChanges(changes) {
    if (!onSave) {
      setError("Saving is not configured for this housing booking.");
      return false;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        ...housing,
        ...changes,
      });

      setEditingField(null);
      return true;
    } catch (err) {
      setError(err.message || "Unable to save housing booking.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  /**
   * Creates an update object containing modified description properties.
   *
   * Preserves existing description fields that are not being changed.
   *
   * @param {Object} changes - The description properties to modify.
   * @returns {Object} The housing update object containing the merged description.
   */
  function getDescriptionChanges(changes) {
    return {
      description: {
        ...(housing.description ?? {}),
        ...changes,
      },
    };
  }

  /**
   * Validates and saves the housing booking's name.
   *
   * @param {Event} event - The form submission event.
   */
  async function saveName(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    await saveChanges(getDescriptionChanges({ name: trimmedName }));
  }

  /**
   * Saves the housing booking's description.
   *
   * @param {Event} event - The form submission event.
   */
  async function saveDescription(event) {
    event.preventDefault();

    await saveChanges(
      getDescriptionChanges({
        description: housingDescription.trim(),
      })
    );
  }

  /**
   * Saves the housing booking's notes.
   *
   * @param {Event} event - The form submission event.
   */
  async function saveNotes(event) {
    event.preventDefault();

    await saveChanges(getDescriptionChanges({ notes }));
  }

  /**
   * Validates and saves the housing booking's daily cost range and currency.
   *
   * Ensures the cost is correctly formatted and the maximum is not less
   * than the minimum.
   *
   * @param {Event} event - The form submission event.
   */
  async function saveCost(event) {
    event.preventDefault();

    const match = costAmount.trim().match(
      /^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?$/
    );

    if (!match) {
      setError("Enter a cost like 80 or 80-120.");
      return;
    }

    const lower = Number(match[1]);
    const upper = Number(match[2] ?? match[1]);

    if (upper < lower) {
      setError("The maximum cost cannot be less than the minimum.");
      return;
    }

    await saveChanges({
      costPerDay: {
        lowerEnd: lower,
        upperEnd: upper,
        currency: currency.trim().toUpperCase() || "USD",
      },
    });
  }

  /**
   * Validates and saves a fixed check-in date and number of nights.
   *
   * Clears the trip section assignment when using a fixed schedule.
   *
   * @param {Event} event - The form submission event.
   */
  async function saveFixedSchedule(event) {
    event.preventDefault();

    if (!fixedCheckInDate) {
      setError("A check-in date is required.");
      return;
    }

    const parsedNights = Number(nights);

    if (!Number.isInteger(parsedNights) || parsedNights < 1) {
      setError("Nights must be a whole number greater than zero.");
      return;
    }

    await saveChanges({
      tripSectionId: null,
      fixedCheckInDate,
      nights: parsedNights,
    });
  }

  /**
   * Saves the check-in and check-out times.
   *
   * @param {Event} event - The form submission event.
   */
  async function saveTimes(event) {
    event.preventDefault();

    await saveChanges({
      checkInTime: checkInTime || null,
      checkOutTime: checkOutTime || null,
    });
  }

  /**
   * Changes the housing booking's trip section assignment.
   *
   * Assigns fixed dates when no section is selected, or clears the fixed
   * check-in date when a trip section is selected.
   *
   * @param {Event} event - The selection change event.
   */
  async function changeTripSection(event) {
    const value = event.target.value;

    if (value === "") {
      const currentDate =
        housing.checkInDate ??
        housing.fixedCheckInDate ??
        "";

      const currentNights =
        housing.nights ??
        calculateNights(housing.checkInDate, housing.checkOutDate);

      setFixedCheckInDate(currentDate);
      setNights(currentNights);

      await saveChanges({
        tripSectionId: null,
        fixedCheckInDate: currentDate,
        nights: currentNights,
      });

      return;
    }

    await saveChanges({
      tripSectionId: Number(value),
      fixedCheckInDate: null,
    });
  }

  /**
   * Discards unsaved changes and restores the housing booking's current values.
   *
   * Resets all editing fields and clears any displayed error.
   */
  function cancelEditing() {
    const currentDescription = housing.description ?? {};

    setName(currentDescription.name ?? "");
    setHousingDescription(currentDescription.description ?? "");
    setNotes(currentDescription.notes ?? "");

    setCostAmount(formatCostAmount(housing.costPerDay));
    setCurrency(housing.costPerDay?.currency ?? "USD");

    setFixedCheckInDate(
      housing.fixedCheckInDate ?? housing.checkInDate ?? ""
    );

    setNights(
      housing.nights ??
        calculateNights(housing.checkInDate, housing.checkOutDate)
    );

    setCheckInTime(housing.checkInTime ?? "");
    setCheckOutTime(housing.checkOutTime ?? "");

    setEditingField(null);
    setError("");
  }

  /**
   * Formats the housing booking's daily cost for display.
   *
   * @returns {string} The formatted cost and currency, or "Add cost".
   */
  function formatCost() {
    if (!housing.costPerDay) return "Add cost";

    const amount = formatCostAmount(housing.costPerDay);

    if (!amount || amount === "0") return "Add cost";

    return `${amount} ${housing.costPerDay.currency || "USD"}`;
  }

  /**
   * Gets the name of the assigned trip section or identifies the schedule as fixed.
   *
   * @returns {string} The trip section name or "Fixed dates".
   */
  function formatSchedule() {
    if (housing.tripSectionId != null) {
      const section = tripSections.find(
        (item) => item.id === housing.tripSectionId
      );

      return section?.name ?? "Assigned section";
    }

    return "Fixed dates";
  }

  const picture = description.picture ?? null;
  const isSectionBased = housing.tripSectionId != null;

  const displayedCheckInDate =
    housing.checkInDate ?? housing.fixedCheckInDate ?? null;

  const displayedCheckOutDate = housing.checkOutDate ?? null;

  const displayedNights =
    housing.nights ??
    calculateNights(housing.checkInDate, housing.checkOutDate);

  return (
    <article className="housing-card">
      <div className="housing-card-picture">
        {picture ? (
          <img src={picture} alt={description.name || "Housing"} />
        ) : (
          <div className="housing-card-picture-placeholder">
            No picture
          </div>
        )}
      </div>

      <div className="housing-card-heading">
        {editingField === "name" ? (
          <form onSubmit={saveName} className="housing-name-form">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Housing name"
              autoFocus
              required
            />

            <div className="housing-card-actions">
              <button type="submit" disabled={saving}>Save</button>
              <button type="button" disabled={saving} onClick={cancelEditing}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="housing-card-name"
            onClick={() => setEditingField("name")}
            title="Click to edit name"
          >
            {description.name || "Untitled housing"}
          </button>
        )}

        <button
          type="button"
          className="housing-card-expand"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse housing" : "Expand housing"}
        >
          {expanded ? "Collapse ▲" : "Expand ▼"}
        </button>
      </div>

      {error && (
        <p className="housing-card-error" role="alert">
          {error}
        </p>
      )}

      {expanded && (
        <div className="housing-card-details">
          {/* Description */}
          <div className="housing-description-field">
            {editingField === "description" ? (
              <form onSubmit={saveDescription} className="housing-description-form">
                <textarea
                  value={housingDescription}
                  onChange={(event) => setHousingDescription(event.target.value)}
                  placeholder="Add a description..."
                  autoFocus
                />

                <div className="housing-card-actions">
                  <button type="submit" disabled={saving}>Save</button>
                  <button type="button" disabled={saving} onClick={cancelEditing}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="housing-card-inline-value housing-description-value"
                onClick={() => setEditingField("description")}
                title="Click to edit description"
              >
                {description.description || "Add description"}
              </button>
            )}
          </div>

          {/* Trip section */}
          <div className="housing-editable-field">
            <strong>Trip section:</strong>

            <select
              className="housing-section-select"
              value={housing.tripSectionId ?? ""}
              onChange={changeTripSection}
              disabled={saving}
              aria-label="Trip section"
            >
              <option value="">No section</option>

              {tripSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          {editingField === "schedule" ? (
            <form onSubmit={saveFixedSchedule} className="housing-schedule-form">
              <label>
                Check-in date
                <input
                  type="date"
                  value={fixedCheckInDate}
                  onChange={(event) => setFixedCheckInDate(event.target.value)}
                  required
                />
              </label>

              <label>
                Nights
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={nights}
                  onChange={(event) => setNights(event.target.value)}
                  required
                />
              </label>

              <div className="housing-card-actions">
                <button type="submit" disabled={saving}>Save</button>
                <button type="button" disabled={saving} onClick={cancelEditing}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="housing-card-inline-value housing-schedule-value"
              onClick={() => {
                if (!isSectionBased) setEditingField("schedule");
              }}
              disabled={isSectionBased}
              title={
                isSectionBased
                  ? "Dates are determined by the selected trip section"
                  : "Click to edit dates"
              }
            >
              {formatDate(displayedCheckInDate)} - {formatDate(displayedCheckOutDate)}
            </button>
          )}

          {/* Check-in and check-out times */}
          {editingField === "times" ? (
            <form onSubmit={saveTimes} className="housing-times-form">
              <label>
                Check-in
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(event) => setCheckInTime(event.target.value)}
                />
              </label>

              <label>
                Check-out
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(event) => setCheckOutTime(event.target.value)}
                />
              </label>

              <div className="housing-card-actions">
                <button type="submit" disabled={saving}>Save</button>
                <button type="button" disabled={saving} onClick={cancelEditing}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="housing-card-inline-value housing-times-value"
              onClick={() => setEditingField("times")}
              title="Click to edit times"
            >
              Check-in {formatTime(housing.checkInTime)} - Check-out{" "}
              {formatTime(housing.checkOutTime)}
            </button>
          )}

          {/* Cost */}
          <div className="housing-editable-field">
            <strong>Cost per day:</strong>

            {editingField === "cost" ? (
              <form onSubmit={saveCost} className="housing-cost-form">
                <div className="housing-cost-inputs">
                  <input
                    type="text"
                    className="housing-cost-amount"
                    placeholder="80 or 80-120"
                    value={costAmount}
                    onChange={(event) => setCostAmount(event.target.value)}
                    autoFocus
                  />

                  <input
                    type="text"
                    className="housing-cost-currency"
                    placeholder="USD"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    maxLength={3}
                  />
                </div>

                <div className="housing-card-actions">
                  <button type="submit" disabled={saving}>Save</button>
                  <button type="button" disabled={saving} onClick={cancelEditing}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="housing-card-inline-value"
                onClick={() => setEditingField("cost")}
                title="Click to edit cost"
              >
                {formatCost()}
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="housing-editable-field">
            <strong>Notes:</strong>

            {editingField === "notes" ? (
              <form onSubmit={saveNotes} className="housing-notes-form">
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes..."
                  autoFocus
                />

                <div className="housing-card-actions">
                  <button type="submit" disabled={saving}>Save</button>
                  <button type="button" disabled={saving} onClick={cancelEditing}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="housing-card-inline-value housing-notes-value"
                onClick={() => setEditingField("notes")}
                title="Click to edit notes"
              >
                {description.notes || "Add notes"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default HousingCard;
