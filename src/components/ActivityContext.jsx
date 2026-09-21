import { createContext, useContext, useState } from "react";

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "Visit Fushimi Inari",
      picture: "",
      date: "2026-10-12",
      startTime: "",
      endTime: "",
      cost: "",
      notes: "Walk through the torii gates.\nBring comfortable shoes.",
    },
    {
      id: 2,
      name: "Arashiyama Bamboo Grove",
      picture: "",
      date: "2026-10-13",
      startTime: "",
      endTime: "",
      cost: "",
      notes: "Explore the bamboo forest.",
    },
  ]);

  function addActivity(activity) {
    setActivities([
      ...activities,
      {
        id: crypto.randomUUID(),
        ...activity,
      },
    ]);
  }

  function updateActivity(updatedActivity) {
    setActivities(
      activities.map((activity) =>
        activity.id === updatedActivity.id
          ? updatedActivity
          : activity
      )
    );
  }

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        updateActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivityContext);
}