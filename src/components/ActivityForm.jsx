/**
 * Component name: ActivityForm
 * Date: 09/20/2026
 * Programmer: Ryan Sommerhauser
 * Description: Provides a form for adding a new activity or editing an
 * existing activity's name.
 */
import { useState } from "react";

/**
 * Renders a form for entering or editing an activity name.
 *
 * @param {Object} props - The component properties.
 * @param {Object|null} props.activity - The activity being edited, or null when adding.
 * @param {Function} props.onSave - Callback invoked with the activity data when submitted.
 * @param {Function} props.onCancel - Optional callback invoked when editing is cancelled.
 * @returns {JSX.Element} The activity form.
 */
function ActivityForm({ activity, onSave, onCancel }) {
  const [name, setName] = useState(activity?.name || "");

  /**
   * Validates the activity name and submits the activity data.
   *
   * Trims whitespace and prevents submission when the name is empty.
   * Preserves existing activity properties when editing.
   *
   * @param {Event} event - The form submission event.
   */
  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (activity) {
      onSave({
        ...activity,
        name: trimmedName,
      });
    } else {
      onSave({
        name: trimmedName,
      });
    }
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>{activity ? "Edit Activity Name" : "Add Activity"}</h2>

      <input
        type="text"
        placeholder="Activity name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        required
      />

      <div>
        <button type="submit">Save</button>

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
