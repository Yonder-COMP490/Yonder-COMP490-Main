import { useEffect, useState } from "react";
import "./ActivityCard.css";

function ActivityCard({ activity, onSave }) {
  const description = activity.description ?? {};

  const [expanded, setExpanded] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [name, setName] = useState(description.name ?? "");
  const [activityDescription, setActivityDescription] = useState(
    description.description ?? ""
  );
  const [costAmount, setCostAmount] = useState(
    formatCostAmount(activity.cost)
  );
  const [currency, setCurrency] = useState(
    activity.cost?.currency ?? "USD"
  );
  const [notes, setNotes] = useState(description.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentDescription = activity.description ?? {};

    setName(currentDescription.name ?? "");
    setActivityDescription(currentDescription.description ?? "");
    setCostAmount(formatCostAmount(activity.cost));
    setCurrency(activity.cost?.currency ?? "USD");
    setNotes(currentDescription.notes ?? "");
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

  function getDescriptionChanges(changes) {
    return {
      description: {
        ...(activity.description ?? {}),
        ...changes,
      },
    };
  }

  async function saveName(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    await saveChanges(
      getDescriptionChanges({ name: trimmedName })
    );
  }

  async function saveDescription(event) {
    event.preventDefault();

    await saveChanges(
      getDescriptionChanges({
        description: activityDescription.trim(),
      })
    );
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

    const normalizedCurrency = currency.trim().toUpperCase() || "USD";

    const saved = await saveChanges({
      cost: {
        lowerEnd: lower,
        upperEnd: upper,
        currency: normalizedCurrency,
      },
    });

    if (saved) {
      setCostAmount(
        lower === upper ? `${lower}` : `${lower}-${upper}`
      );
      setCurrency(normalizedCurrency);
    }
  }

  async function saveNotes(event) {
    event.preventDefault();

    await saveChanges(
      getDescriptionChanges({ notes })
    );
  }

  function cancelEditing() {
    const currentDescription = activity.description ?? {};

    setName(currentDescription.name ?? "");
    setActivityDescription(currentDescription.description ?? "");
    setCostAmount(formatCostAmount(activity.cost));
    setCurrency(activity.cost?.currency ?? "USD");
    setNotes(currentDescription.notes ?? "");

    setEditingField(null);
    setError("");
  }

  function formatDate() {
    if (activity.fixedDate || activity.date) {
      return `Date: ${activity.fixedDate || activity.date}`;
    }

    if (activity.tripDay != null) {
      return `Trip day ${activity.tripDay}`;
    }

    return "Not scheduled";
  }

  const picture = activity.description?.picture ?? null;

  return (
    <article className="activity-card">
      <div
        className="activity-card-picture"
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(
            "application/x-yonder-activity",
            String(activity.id)
          );

          event.dataTransfer.effectAllowed = "copy";
        }}
        title="Drag into the itinerary to schedule"
      >
        {picture ? (
          <img
            src={picture}
            alt={activity.description?.name || "Activity"}
            draggable={false}
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

            <div className="activity-card-actions">
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
            className="activity-card-name"
            onClick={() => setEditingField("name")}
            title="Click to edit name"
          >
            {activity.description?.name || "Untitled activity"}
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
          {/* Description */}
          <div className="activity-description-field">
            {editingField === "description" ? (
              <form
                onSubmit={saveDescription}
                className="activity-description-form"
              >
                <textarea
                  value={activityDescription}
                  onChange={(event) =>
                    setActivityDescription(event.target.value)
                  }
                  placeholder="Add a description..."
                  autoFocus
                />

                <div className="activity-card-actions">
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
                className="activity-card-inline-value activity-description-value"
                onClick={() => setEditingField("description")}
                title="Click to edit description"
              >
                {activity.description?.description || "Add description"}
              </button>
            )}
          </div>

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

                <div className="activity-card-actions">
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
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes..."
                  autoFocus
                />

                <div className="activity-card-actions">
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
                className="activity-card-inline-value activity-notes-value"
                onClick={() => setEditingField("notes")}
                title="Click to edit notes"
              >
                {activity.description?.notes || "Add notes"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default ActivityCard;