/**
 * Component name: Activities
 * Date: 09/20/2026
 * Programmer: Ryan Sommerhauser
 * Description: Displays the activities for the current trip and provides
 * functionality for adding and updating activities.
 */
import { Link } from "react-router-dom";

import ActivityCard from "../components/ActivityCard";
import ActivityForm from "../components/ActivityForm";
import { useActivities } from "../components/ActivityContext";

import "./Activities.css";

/**
 * Displays the activities page using shared activity data from ActivityContext.
 *
 * Shows a loading message while activities are being retrieved and displays
 * any loading errors. Renders an ActivityCard for each activity and an
 * ActivityForm for adding new activities.
 *
 * @returns {JSX.Element} The activities page.
 */
function Activities() {
  const {
    activities,
    loading,
    error,
    addActivity,
    updateActivity,
  } = useActivities();

  if (loading) {
    return <p>Loading activities...</p>;
  }

  /**
   * Creates a new activity using the activity context.
   *
   * @param {Object} activity - The activity to add.
   * @returns {Promise<void>} A promise that resolves when the activity is added.
   */
  async function handleAdd(activity) {
    await addActivity(activity);
  }

  /**
   * Updates an existing activity using the activity context.
   *
   * @param {Object} activity - The updated activity data.
   * @returns {Promise<void>} A promise that resolves when the activity is updated.
   */
  async function handleUpdate(activity) {
    await updateActivity(activity);
  }

  return (
    <div>
      <h1>Activities</h1>

      {error && (
        <p role="alert">
          Failed to load activities: {error}
        </p>
      )}

      <div className="activities">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onSave={handleUpdate}
          />
        ))}

        <ActivityForm onSave={handleAdd} />
      </div>

      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Activities;
