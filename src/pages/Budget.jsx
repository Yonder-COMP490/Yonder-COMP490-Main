import { useActivities } from "../components/ActivityContext";
import Cost from "../components/Cost";

function Budget() {
  const { activities } = useActivities();

  const total = new Cost();

  activities.forEach((activity) => {
    total.addCost(activity.cost);
  });

  return (
    <div>
      <h1>Budget</h1>

      <h2>Activities</h2>

      {activities.map((activity) => (
        <div key={activity.id}>
          <span>{activity.name}: </span>
          <span>{activity.cost.toString()}</span>
        </div>
      ))}

      <h2>Total: {total.toString()}</h2>
    </div>
  );
}

export default Budget;