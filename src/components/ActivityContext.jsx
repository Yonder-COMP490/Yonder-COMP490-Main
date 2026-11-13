
import { createContext, useContext, useEffect, useState } from "react";
import ActivityAPI from "../api/ActivityAPI";

const ActivityContext = createContext();

export function ActivityProvider({ children, tripId = 1 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      setLoading(true);
      setActivities([]);
      setError("");

      try {
        const data = await ActivityAPI.getAll(tripId);

        if (!cancelled) {
          setActivities(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  async function addActivity(activity) {
    const created = await ActivityAPI.add(activity, tripId);

    setActivities((current) => [...current, created]);

    return created;
  }

  async function updateActivity(updatedActivity) {
    const updated = await ActivityAPI.update(
      updatedActivity.id,
      updatedActivity,
      tripId
    );

    setActivities((current) =>
      current.map((activity) =>
        activity.id === updated.id ? updated : activity
      )
    );

    return updated;
  }

  async function removeActivity(id) {
    await ActivityAPI.remove(id, tripId);

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
        tripId,
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
