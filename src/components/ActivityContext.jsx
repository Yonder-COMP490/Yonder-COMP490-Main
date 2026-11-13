/**
 * Class name: ActivityContext
 * Date: 09/20/2026
 * Programmer: Ryan Sommerhauser
 * Description: Provides shared activity state and management operations
 * throughout the application for the selected trip. Loads and refreshes
 * activities when the selected trip changes and provides functions for
 * creating, updating, deleting, and changing the scheduling mode of
 * activities. Also provides loading and error states and generates
 * map marker data from activities with location coordinates.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import ActivityAPI from "../api/ActivityAPI";

const ActivityContext = createContext();

export function ActivityProvider({ children, tripId = 1 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Reloads activities belonging to the selected trip.
   */
  async function refreshActivities() {
    try {
      const data = await ActivityAPI.getAll(tripId);

      setActivities(data);
      setError("");

      return data;
    } catch (err) {
      setError(err.message || "Failed to load activities.");
      throw err;
    }
  }

  /**
   * Loads the correct activities whenever the trip changes.
   */
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
          setError(
            err.message || "Failed to load activities."
          );
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

  /**
   * Creates an activity for the selected trip.
   */
  async function addActivity(activity) {
    const created = await ActivityAPI.add(
      activity,
      tripId
    );

    setActivities((current) => [
      ...current,
      created,
    ]);

    return created;
  }

  /**
   * Updates an activity belonging to the selected trip.
   */
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

  /**
   * Changes the activity's scheduling mode.
   *
   * The current backend supports this operation
   * through the legacy endpoint for trip 1.
   */
  async function switchScheduleType(id, useFixedDate) {
    const updated = await ActivityAPI.switchScheduleType(
      id,
      useFixedDate,
      tripId
    );

    setActivities((current) =>
      current.map((activity) =>
        activity.id === updated.id ? updated : activity
      )
    );

    return updated;
  }

  /**
   * Deletes an activity from the selected trip.
   */
  async function removeActivity(id) {
    await ActivityAPI.remove(id, tripId);

    setActivities((current) =>
      current.filter((activity) => activity.id !== id)
    );
  }

  /**
   * Converts activities with coordinates into map markers.
   */
  function getMapMarkers() {
    return activities
      .filter((activity) => {
        const latitude =
          activity.location?.latitude ??
          activity.latitude;

        const longitude =
          activity.location?.longitude ??
          activity.longitude;

        return latitude != null && longitude != null;
      })
      .map((activity) => ({
        id: activity.id,
        type: "activity",
        name:
          activity.description?.name ??
          activity.name ??
          "Activity",
        latitude: Number(
          activity.location?.latitude ??
          activity.latitude
        ),
        longitude: Number(
          activity.location?.longitude ??
          activity.longitude
        ),
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
        switchScheduleType,
        refreshActivities,
        getMapMarkers,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

/**
 * Provides access to the shared activity context.
 *
 * @returns {Object} The activity context containing activity data,
 * loading and error states, and activity management functions.
 */
export function useActivities() {
  return useContext(ActivityContext);
}
