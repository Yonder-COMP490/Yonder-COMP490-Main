
import { Link } from "react-router-dom";

import ActivityCard from "../components/ActivityCard";
import ActivityForm from "../components/ActivityForm";
import { useActivities } from "../components/ActivityContext";

import "./Activities.css";

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

  async function handleAdd(activity) {
    await addActivity(activity);
  }

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
