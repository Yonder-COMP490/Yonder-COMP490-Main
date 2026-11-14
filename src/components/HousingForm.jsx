
/**
 * Component name: HousingForm
 * Date: 09/26/2026
 * Programmer: Ryan Sommerhauser
 * Description: Provides a form for adding a new housing booking or editing
 * an existing housing booking's name.
 */
import { useState } from "react";

/**
 * Renders a form for entering or editing a housing booking name.
 *
 * @param {Object} props - The component properties.
 * @param {Object|null} props.housing - The housing booking being edited,
 * or null when adding.
 * @param {Function} props.onSave - Callback invoked with the housing data when submitted.
 * @param {Function} props.onCancel - Optional callback invoked when editing is cancelled.
 * @returns {JSX.Element} The housing form.
 */
function HousingForm({ housing, onSave, onCancel }) {
  const [name, setName] = useState(housing?.name || "");

  /**
   * Validates the housing name and submits the housing data.
   *
   * Trims whitespace and prevents submission when the name is empty.
   * Preserves existing housing properties when editing.
   *
   * @param {Event} event - The form submission event.
   */
  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (housing) {
      onSave({
        ...housing,
        name: trimmedName,
      });
    } else {
      onSave({
        name: trimmedName,
      });
    }
  }

  return (
    <form className="housing-form" onSubmit={handleSubmit}>
      <h2>{housing ? "Edit Housing Name" : "Add Housing"}</h2>

      <input
        type="text"
        placeholder="Housing name"
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

export default HousingForm;
