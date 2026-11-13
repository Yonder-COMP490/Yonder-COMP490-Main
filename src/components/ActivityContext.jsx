/**
 * Class name: ActivityContext
 * Date: 09/20/2026
 * Programmer: Ryan Sommerhauser
 * Description: Manages shared activity data and operations throughout the
 * application. Provides activity state, loading and error information,
 * and functions for creating, updating, deleting, refreshing, and
 * retrieving map marker data for activities.
 */
import { createContext, useContext, useEffect, useState } from "react";
import ActivityAPI from "../api/ActivityAPI";

const ActivityContext = createContext();

/**
 * Provides activity data and management functions to child components.
 *
 * Loads activities from the backend when mounted and maintains the shared
 * activity state through React Context.
 *
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The child components receiving
 * access to the activity context.
 * @returns {JSX.Element} The ActivityContext provider containing its children.
 */
export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Retrieves map marker data for all activities with valid coordinates.
   *
   * @returns {Array} The map markers generated from activities.
   */
  function getMapMarkers() {
    return activities
      .filter(
        (activity) =>
          activity.location?.latitude != null &&
          activity.location?.longitude != null
      )
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        latitude: activity.location.latitude,
        longitude: activity.location.longitude,
      }));
  }
  
  /**
   * Retrieves the latest activities from the backend and updates the shared state.
   *
   * Clears the current error when successful and stores the error message
   * if the request fails.
   *
   * @returns {Promise<Array>} The refreshed list of activities.
   * @throws {Error} If the request fails.
   */
  async function refreshActivities() {
    try {
      const data = await ActivityAPI.getAll();
      setActivities(data);
      setError("");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  useEffect(() => {
    async function loadActivities() {
      try {
        setError("");
        await refreshActivities();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  /**
   * Creates a new activity in the backend and adds it to the shared activity state.
   *
   * @param {Object} activity - The activity to create.
   * @returns {Promise<Object>} The newly created activity.
   * @throws {Error} If the creation request fails.
   */
  async function addActivity(activity) {
    const created = await ActivityAPI.add(activity);
    setActivities((current) => [...current, created]);
    return created;
  }

  /**
   * Updates an existing activity in the backend and replaces its entry
   * in the shared activity state.
   *
   * @param {Object} updatedActivity - The updated activity data, including its ID.
   * @returns {Promise<Object>} The updated activity returned by the backend.
   * @throws {Error} If the update request fails.
   */
  async function updateActivity(updatedActivity) {
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
  }

  /**
   * Switches an activity between trip-day and fixed-date scheduling.
   *
   * Updates the activity in the backend and replaces its entry
   * in the shared activity state.
   *
   * @param {number} id - The ID of the activity to modify.
   * @param {boolean} useFixedDate - Whether the activity should use a fixed date.
   * @returns {Promise<Object>} The updated activity returned by the backend.
   * @throws {Error} If the schedule cannot be switched.
   */
  async function switchScheduleType(id, useFixedDate) {
    const updated = await ActivityAPI.switchScheduleType(id, useFixedDate);

    setActivities((current) =>
      current.map((activity) =>
        activity.id === updated.id ? updated : activity
      )
    );

    return updated;
  }

  /**
   * Deletes an activity from the backend and removes it from the shared state.
   *
   * @param {number} id - The ID of the activity to delete.
   * @returns {Promise<void>} A promise that resolves when deletion succeeds.
   * @throws {Error} If the deletion request fails.
   */
  async function removeActivity(id) {
    await ActivityAPI.remove(id);

    setActivities((current) =>
      current.filter((activity) => activity.id !== id)
    );
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