import { createContext, useContext, useEffect, useState } from "react";
import ActivityAPI from "../api/ActivityAPI";

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivities() {
      try {
        setError("");
        const data = await ActivityAPI.getAll();
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  async function addActivity(activity) {
    try {
      const created = await ActivityAPI.add(activity);
      setActivities((current) => [...current, created]);
      return created;
    } catch (err) {
      throw err;
    }
  }

  async function updateActivity(updatedActivity) {
    try {
      const updated = await ActivityAPI.update(
        updatedActivity.id,
        updatedActivity
      );

      setActivities((current) =>
        current.map((activity) =>
          activity.id === updated.id ? updated : activity
        )
      );

      return updated;
    } catch (err) {
      throw err;
    }
  }

  async function removeActivity(id) {
    await ActivityAPI.remove(id);

    setActivities((current) =>
      current.filter((activity) => activity.id !== id)
    );
  }

  function getMapMarkers() {
    return activities
      .filter(
        (activity) =>
          activity.latitude != null &&
          activity.longitude != null
      )
      .map((activity) => ({
        id: activity.id,
        type: "activity",
        name: activity.name,
        latitude: Number(activity.latitude),
        longitude: Number(activity.longitude),
      }));
  }

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        error,
        addActivity,
        updateActivity,
        removeActivity,
        getMapMarkers,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivityContext);
}