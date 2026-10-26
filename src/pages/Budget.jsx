
import { useEffect, useState } from "react";
import BudgetAPI from "../api/BudgetAPI";
import "./Budget.css";

// Format a Cost object returned by the Java backend.
function formatCost(cost) {
  if (!cost) return "$0";

  const lower = Number(cost.lowerEnd ?? cost.amount ?? 0);
  const upper = Number(cost.upperEnd ?? cost.amount ?? cost.lowerEnd ?? 0);
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

function Budget() {
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

  async function refreshBudget() {
    try {
      setError("");
      const data = await BudgetAPI.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Failed to load the budget.");
    }
  }

  useEffect(() => {
    async function loadBudget() {
      setLoading(true);
      await refreshBudget();
      setLoading(false);
    }

    loadBudget();
  }, []);

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

  // BudgetEntry uses sourceId/sourceType, not the original item's id.
  // The API's daily entries refer to BudgetItem objects.
  function startEditingDailyItem(entry) {
    setDailyName(entry.name || "");
    setDailyCost(String(entry.unitCost?.lowerEnd ?? 0));
    setDailyDays(String(entry.quantity ?? 1));

    setEditingItemId(entry.sourceId);
    setAddingDailyItem(false);
  }

  async function handleSaveDailyItem() {
    const name = dailyName.trim();
    const cost = Number(dailyCost);
    const days = Number(dailyDays);

    if (!name) {
      setError("Please enter a name for the budget item.");
      return;
    }

    if (dailyCost === "" || !Number.isFinite(cost) || cost < 0) {
      setError("Please enter a valid cost.");
      return;
    }

    if (
      dailyDays === "" ||
      !Number.isInteger(days) ||
      days < 1
    ) {
      setError("Days must be a whole number greater than zero.");
      return;
    }

    const item = {
      name,
      cost: {
        lowerEnd: cost,
        upperEnd: cost,
        currency: summary?.totalCost?.currency || "USD",
      },
      days,
    };

    try {
      setSaving(true);
      setError("");

      if (editingItemId !== null) {
        await BudgetAPI.update(editingItemId, item);
      } else {
        await BudgetAPI.add(item);
      }

      resetDailyForm();
      await refreshBudget();
    } catch (err) {
      setError(err.message || "Failed to save the budget item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDailyItem(itemId) {
    if (!window.confirm("Are you sure you want to delete this budget item?")) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await BudgetAPI.remove(itemId);
      await refreshBudget();

      if (editingItemId === itemId) {
        resetDailyForm();
      }
    } catch (err) {
      setError(err.message || "Failed to delete the budget item.");
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
        <button onClick={async () => {
          setLoading(true);
          await refreshBudget();
          setLoading(false);
        }}>
          Retry
        </button>
      </div>
    );
  }

  // The Java API returns one flat entries array.
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
                  {formatCost(entry.totalCost)}
                  {" "}
                  ({entry.quantity} {entry.unit} ×{" "}
                  {formatCost(entry.unitCost)})
                </span>

                <div className="budget-item-actions">
                  <button
                    type="button"
                    onClick={() => startEditingDailyItem(entry)}
                    disabled={saving}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDailyItem(entry.sourceId)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {!addingDailyItem && editingItemId === null && (
              <button
                className="budget-add-button"
                onClick={startAddingDailyItem}
                disabled={saving}
              >
                + Add Daily Item
              </button>
            )}

            {(addingDailyItem || editingItemId !== null) && (
              <div className="budget-add-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={dailyName}
                  onChange={(event) => setDailyName(event.target.value)}
                />

                <input
                  type="number"
                  placeholder="Cost per day"
                  min="0"
                  step="0.01"
                  value={dailyCost}
                  onChange={(event) => setDailyCost(event.target.value)}
                />

                <input
                  type="number"
                  placeholder="Days"
                  min="1"
                  step="1"
                  value={dailyDays}
                  onChange={(event) => setDailyDays(event.target.value)}
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
        <span>{formatCost(summary.totalCost)}</span>
      </div>
    </div>
  );
}

export default Budget;
