import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import ActivityForm from "../components/ActivityForm";
import { useActivities } from "../components/ActivityContext";
import "./Activities.css";

function Activities() {
  const { activities, addActivity, updateActivity } = useActivities();

  const [editingActivityId, setEditingActivityId] = useState(null);

  function handleSave(activity) {
    if (editingActivityId !== null) {
      updateActivity(activity);
      setEditingActivityId(null);
    } else {
      addActivity(activity);
    }
  }

  return (
    <div>
      <h1>Activities</h1>

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
              onEdit={() => setEditingActivityId(activity.id)}
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