
import { useState } from "react";
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

  const [editingActivityId, setEditingActivityId] = useState(null);
  const [saveError, setSaveError] = useState("");

  async function handleSave(activity) {
    setSaveError("");

    try {
      if (editingActivityId !== null) {
        await updateActivity(activity);
        setEditingActivityId(null);
      } else {
        await addActivity(activity);
      }
    } catch (err) {
      setSaveError(err.message);
    }
  }

  if (loading) {
    return <p>Loading activities...</p>;
  }

  return (
    <div>
      <h1>Activities</h1>

      {error && <p role="alert">Failed to load activities: {error}</p>}

      {saveError && <p role="alert">Failed to save activity: {saveError}</p>}

      <div className="activities">
        {activities.map((activity) =>
          editingActivityId === activity.id ? (
            <ActivityForm
              key={activity.id}
              activity={activity}
              onSave={handleSave}
              onCancel={() => setEditingActivityId(null)}
            />
          ) : (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={() => {
                setSaveError("");
                setEditingActivityId(activity.id);
              }}
            />
          )
        )}

        <ActivityForm onSave={handleSave} />
      </div>

      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Activities;
