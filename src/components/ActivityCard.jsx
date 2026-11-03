
import { useEffect, useState } from "react";
import "./ActivityCard.css";

function ActivityCard({ activity, onSave }) {
  const [expanded, setExpanded] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [name, setName] = useState(activity.name || "");
  const [costAmount, setCostAmount] = useState(
    formatCostAmount(activity.cost)
  );
  const [currency, setCurrency] = useState(
    activity.cost?.currency || "USD"
  );
  const [notes, setNotes] = useState(activity.notes || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(activity.name || "");
    setCostAmount(formatCostAmount(activity.cost));
    setCurrency(activity.cost?.currency || "USD");
    setNotes(activity.notes || "");
  }, [activity]);

  function formatCostAmount(cost) {
    if (!cost) return "";

    const lower = Number(cost.lowerEnd ?? 0);
    const upper = Number(cost.upperEnd ?? lower);

    return lower === upper ? `${lower}` : `${lower}-${upper}`;
  }

  function formatCost() {
    if (!activity.cost) return "Add cost";

    const amount = formatCostAmount(activity.cost);

    if (!amount || amount === "0") return "Add cost";

    return `${amount} ${activity.cost.currency || "USD"}`;
  }

  async function saveChanges(changes) {
    if (!onSave) {
      setError("Saving is not configured for this activity.");
      return false;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        ...activity,
        ...changes,
      });

      setEditingField(null);
      return true;
    } catch (err) {
      setError(err.message || "Unable to save activity.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveName(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    await saveChanges({ name: trimmedName });
  }

  async function saveCost(event) {
    event.preventDefault();

    const match = costAmount.trim().match(
      /^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?$/
    );

    if (!match) {
      setError("Enter a cost like 25 or 25-50.");
      return;
    }

    const lower = Number(match[1]);
    const upper = Number(match[2] ?? match[1]);

    if (upper < lower) {
      setError("The maximum cost cannot be less than the minimum.");
      return;
    }

    const saved = await saveChanges({
      cost: {
        lowerEnd: lower,
        upperEnd: upper,
        currency: currency.trim().toUpperCase() || "USD",
      },
    });

    if (saved) {
      setCostAmount(
        lower === upper ? `${lower}` : `${lower}-${upper}`
      );
      setCurrency(currency.trim().toUpperCase() || "USD");
    }
  }

  async function saveNotes(event) {
    event.preventDefault();

    await saveChanges({ notes });
  }

  function cancelEditing() {
    setName(activity.name || "");
    setCostAmount(formatCostAmount(activity.cost));
    setCurrency(activity.cost?.currency || "USD");
    setNotes(activity.notes || "");
    setEditingField(null);
    setError("");
  }

  function formatDate() {
    if (activity.fixedDate || activity.date) {
      return `Fixed date: ${activity.fixedDate || activity.date}`;
    }

    if (activity.tripDay != null) {
      return `Trip day ${activity.tripDay}`;
    }

    return "Not scheduled";
  }

  return (
    <article className="activity-card">
      <div className="activity-card-picture">
        {activity.picture ? (
          <img
            src={activity.picture}
            alt={activity.name || "Activity"}
          />
        ) : (
          <div className="activity-card-picture-placeholder">
            No picture
          </div>
        )}
      </div>

      <div className="activity-card-heading">
        {editingField === "name" ? (
          <form onSubmit={saveName} className="activity-name-form">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Activity name"
              autoFocus
              required
            />

            <button type="submit" disabled={saving}>
              Save
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="activity-card-name"
            onClick={() => setEditingField("name")}
            title="Click to edit name"
          >
            {activity.name || "Untitled activity"}
          </button>
        )}

        <button
          type="button"
          className="activity-card-expand"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse activity" : "Expand activity"}
        >
          {expanded ? "Collapse ▲" : "Expand ▼"}
        </button>
      </div>

      {error && (
        <p className="activity-card-error" role="alert">
          {error}
        </p>
      )}

      {expanded && (
        <div className="activity-card-details">
          <p>
            <strong>Schedule:</strong> {formatDate()}
          </p>

          <p>
            <strong>Start:</strong> {activity.startTime || "Not set"}
          </p>

          <p>
            <strong>End:</strong> {activity.endTime || "Not set"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {activity.active === false ? "Inactive" : "Active"}
          </p>

          {/* Cost */}
          <div className="activity-editable-field">
            <strong>Cost:</strong>

            {editingField === "cost" ? (
            <form
              onSubmit={saveCost}
              className="activity-cost-form"
            >
              <div className="activity-cost-inputs">
                <input
                  type="text"
                  className="activity-cost-amount"
                  placeholder="25 or 25-50"
                  value={costAmount}
                  onChange={(event) =>
                    setCostAmount(event.target.value)
                  }
                  autoFocus
                />

                <input
                  type="text"
                  className="activity-cost-currency"
                  placeholder="USD"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value)
                  }
                  maxLength={3}
                />
              </div>

              <div className="activity-cost-actions">
                <button type="submit" disabled={saving}>
                  Save
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </form>
            ) : (
              <button
                type="button"
                className="activity-card-inline-value"
                onClick={() => setEditingField("cost")}
                title="Click to edit cost"
              >
                {formatCost()}
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="activity-editable-field">
            <strong>Notes:</strong>

            {editingField === "notes" ? (
              <form
                onSubmit={saveNotes}
                className="activity-notes-form"
              >
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Add notes..."
                  autoFocus
                />

                <button type="submit" disabled={saving}>
                  Save
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="activity-card-inline-value activity-notes-value"
                onClick={() => setEditingField("notes")}
                title="Click to edit notes"
              >
                {activity.notes || "Add notes"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default ActivityCard;
