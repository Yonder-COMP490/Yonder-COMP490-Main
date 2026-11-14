
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import BudgetAPI from "../api/BudgetAPI";
import "./Budget.css";

// Format a Cost object returned by the Java backend.
/**
 * Formats a backend Cost value as a currency amount or range.
 * Supports fixed amounts and lower/upper estimates, falling back to USD.
 *
 * @param {Object|null} cost
 *   Cost supplied by the backend.
 * @returns {string} Localized monetary amount or range.
 */
function formatCost(cost) {
  if (!cost) return "$0";

  const lower = Number(cost.lowerEnd ?? cost.amount ?? 0);
  const upper = Number(
    cost.upperEnd ?? cost.amount ?? cost.lowerEnd ?? 0
  );
  const currency = cost.currency || "USD";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  if (lower === upper) {
    return formatter.format(lower);
  }

  return `${formatter.format(lower)} - ${formatter.format(upper)}`;
}

/**
 * Displays the selected trip's budget summary and expense categories.
 *
 * Gets the trip ID and currency preference from the dashboard's Outlet
 * context, retrieves the matching budget, and supports creating, editing,
 * and deleting daily budget items. Activity, housing, and travel expenses
 * are displayed using the aggregated backend summary.
 *
 * @component
 * @returns {JSX.Element} The trip's budget overview and daily-item editor.
 * @author R. Sommerhauser
 * @author A. Garcia
 * @version 1.0
 * @since 2026-09-23
 */
function Budget() {
  // Provided by TripDashboard through React Router's Outlet.
  const { tripId, trip } = useOutletContext();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedSections, setExpandedSections] = useState({
    activities: true,
    housing: true,
    travel: false,
    daily: true,
  });

  const [editingItemId, setEditingItemId] = useState(null);
  const [addingDailyItem, setAddingDailyItem] = useState(false);

  const [dailyName, setDailyName] = useState("");
  const [dailyCost, setDailyCost] = useState("");
  const [dailyDays, setDailyDays] = useState("");

  const [saving, setSaving] = useState(false);

  // Reload the budget after adding, updating, or deleting an item.
  /**
   * Refreshes the current trip's summary after a budget item changes.
   * Reports request errors without clearing the existing summary.
   *
   * @returns {Promise<void>}
   */
  async function refreshBudget() {
    try {
      setError("");

      const data = await BudgetAPI.getSummary(tripId);

      setSummary(data);
    } catch (err) {
      setError(err.message || "Failed to load the budget.");
    }
  }

  // Load the selected trip's budget.
  // Reload automatically when the trip ID changes.
  /**
   * Loads the selected trip's budget whenever its ID changes.
   * Clears previous-trip state and prevents stale asynchronous responses
   * from updating state after cleanup or navigation to another trip.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadBudget() {
      setLoading(true);
      setSummary(null);
      setError("");

      // Reset the daily-item form when switching trips.
      setEditingItemId(null);
      setAddingDailyItem(false);
      setDailyName("");
      setDailyCost("");
      setDailyDays("");

      try {
        const data = await BudgetAPI.getSummary(tripId);

        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to load the budget."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBudget();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  function toggleSection(section) {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  }

  function resetDailyForm() {
    setDailyName("");
    setDailyCost("");
    setDailyDays("");
    setEditingItemId(null);
    setAddingDailyItem(false);
  }

  function startAddingDailyItem() {
    resetDailyForm();
    setAddingDailyItem(true);
  }

  // BudgetEntry uses sourceId/sourceType, not the
  // original budget item's id.
  /**
   * Populates the daily-expense editor from a summary entry.
   *
   * Summary entries reference the underlying budget item through
   * sourceId rather than a generic entry ID.
   *
   * @param {Object} entry
   *   Budget summary entry to edit.
   */
  function startEditingDailyItem(entry) {
    setDailyName(entry.name || "");
    setDailyCost(
      String(entry.unitCost?.lowerEnd ?? 0)
    );
    setDailyDays(
      String(entry.quantity ?? 1)
    );

    setEditingItemId(entry.sourceId);
    setAddingDailyItem(false);
  }

  /**
   * Validates and creates or updates a daily budget item for this trip.
   *
   * Requires a nonempty name, nonnegative finite cost, and a positive
   * whole-number day count. Uses the trip's preferred currency when
   * available, then reloads the budget after a successful API request.
   *
   * @returns {Promise<void>}
   */
  async function handleSaveDailyItem() {
    const name = dailyName.trim();
    const cost = Number(dailyCost);
    const days = Number(dailyDays);

    if (!name) {
      setError("Please enter a name for the budget item.");
      return;
    }

    if (
      dailyCost === "" ||
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      setError("Please enter a valid cost.");
      return;
    }

    if (
      dailyDays === "" ||
      !Number.isInteger(days) ||
      days < 1
    ) {
      setError(
        "Days must be a whole number greater than zero."
      );
      return;
    }

    const item = {
      name,
      cost: {
        lowerEnd: cost,
        upperEnd: cost,
        currency:
          trip?.preferredCurrency ||
          summary?.totalCost?.currency ||
          "USD",
      },
      days,
    };

    try {
      setSaving(true);
      setError("");

      if (editingItemId !== null) {
        await BudgetAPI.update(
          editingItemId,
          item,
          tripId
        );
      } else {
        await BudgetAPI.add(item, tripId);
      }

      resetDailyForm();
      await refreshBudget();
    } catch (err) {
      setError(
        err.message || "Failed to save the budget item."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Confirms and deletes a daily budget item from the selected trip.
   * Refreshes the summary and clears the editor if its item was deleted.
   *
   * @param {number} itemId - Source ID of the budget item to remove.
   * @returns {Promise<void>}
   */
  async function handleDeleteDailyItem(itemId) {
    if (
      !window.confirm(
        "Are you sure you want to delete this budget item?"
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await BudgetAPI.remove(itemId, tripId);
      await refreshBudget();

      if (editingItemId === itemId) {
        resetDailyForm();
      }
    } catch (err) {
      setError(
        err.message || "Failed to delete the budget item."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="budget-page">
        <h1 className="budget-title">Budget</h1>
        <p>Loading budget...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="budget-page">
        <h1 className="budget-title">Budget</h1>

        <p className="budget-error">
          {error || "Unable to load the budget."}
        </p>

        <button
          onClick={async () => {
            setLoading(true);
            await refreshBudget();
            setLoading(false);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // The Java API returns a single flat entries array.
  const entries = summary.entries ?? [];

  const activities = entries.filter(
    (entry) => entry.category === "Activities"
  );

  const housing = entries.filter(
    (entry) => entry.category === "Housing"
  );

  const travel = entries.filter(
    (entry) => entry.category === "Travel"
  );

  const dailyItems = entries.filter(
    (entry) => entry.category === "Daily"
  );

  return (
    <div className="budget-page">
      <h1 className="budget-title">Budget</h1>

      {error && (
        <div className="budget-error" role="alert">
          {error}
        </div>
      )}

      {/* Activities */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("activities")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.activities ? "▼" : "▶"}
            </span>
            <span>Activities</span>
          </div>

          <span className="budget-section-cost">
            {formatCost(summary.activityTotal)}
          </span>
        </div>

        {expandedSections.activities && (
          <div className="budget-items">
            {activities.length === 0 && (
              <p>No activities with budget entries.</p>
            )}

            {activities.map((entry) => (
              <div
                className="budget-item budget-item-clickable"
                key={`${entry.sourceType}-${entry.sourceId}`}
              >
                <span className="budget-item-name">
                  {entry.name}
                </span>

                <span className="budget-item-cost">
                  {formatCost(entry.totalCost)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Housing */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("housing")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.housing ? "▼" : "▶"}
            </span>
            <span>Housing</span>
          </div>

          <span className="budget-section-cost">
            {formatCost(summary.housingTotal)}
          </span>
        </div>

        {expandedSections.housing && (
          <div className="budget-items">
            {housing.length === 0 && (
              <p>No housing bookings with budget entries.</p>
            )}

            {housing.map((entry) => (
              <div
                className="budget-item budget-item-clickable"
                key={`${entry.sourceType}-${entry.sourceId}`}
              >
                <span className="budget-item-name">
                  {entry.name}
                </span>

                <span className="budget-item-cost">
                  {formatCost(entry.totalCost)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Travel */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("travel")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.travel ? "▼" : "▶"}
            </span>
            <span>Travel</span>
          </div>

          <span className="budget-section-cost">
            {formatCost(summary.travelTotal)}
          </span>
        </div>

        {expandedSections.travel && (
          <div className="budget-items">
            {travel.length === 0 && (
              <p>No travel expenses yet.</p>
            )}

            {travel.map((entry) => (
              <div
                className="budget-item"
                key={`${entry.sourceType}-${entry.sourceId}`}
              >
                <span className="budget-item-name">
                  {entry.name}
                </span>

                <span className="budget-item-cost">
                  {formatCost(entry.totalCost)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("daily")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.daily ? "▼" : "▶"}
            </span>
            <span>Daily</span>
          </div>

          <span className="budget-section-cost">
            {formatCost(summary.dailyTotal)}
          </span>
        </div>

        {expandedSections.daily && (
          <div className="budget-items">
            {dailyItems.map((entry) => (
              <div
                className="budget-item"
                key={`${entry.sourceType}-${entry.sourceId}`}
              >
                <span className="budget-item-name">
                  {entry.name}
                </span>

                <span className="budget-item-cost">
                  {formatCost(entry.totalCost)}{" "}
                  ({entry.quantity} {entry.unit} ×{" "}
                  {formatCost(entry.unitCost)})
                </span>

                <div className="budget-item-actions">
                  <button
                    type="button"
                    onClick={() =>
                      startEditingDailyItem(entry)
                    }
                    disabled={saving}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteDailyItem(entry.sourceId)
                    }
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {!addingDailyItem &&
              editingItemId === null && (
                <button
                  className="budget-add-button"
                  onClick={startAddingDailyItem}
                  disabled={saving}
                >
                  + Add Daily Item
                </button>
              )}

            {(addingDailyItem ||
              editingItemId !== null) && (
              <div className="budget-add-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={dailyName}
                  onChange={(event) =>
                    setDailyName(event.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Cost per day"
                  min="0"
                  step="0.01"
                  value={dailyCost}
                  onChange={(event) =>
                    setDailyCost(event.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Days"
                  min="1"
                  step="1"
                  value={dailyDays}
                  onChange={(event) =>
                    setDailyDays(event.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={handleSaveDailyItem}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItemId !== null
                      ? "Save Changes"
                      : "Add"}
                </button>

                <button
                  type="button"
                  onClick={resetDailyForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="budget-total">
        <span>Total</span>
        <span>
          {formatCost(summary.totalCost)}
        </span>
      </div>
    </div>
  );
}

export default Budget;
