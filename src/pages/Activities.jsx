import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import "./Activities.css";

function Page1() {
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "Visit Fushimi Inari",
      date: "October 12",
      description: "Walk through the torii gates.",
    },
    {
      id: 2,
      name: "Arashiyama Bamboo Grove",
      date: "October 13",
      description: "Explore the bamboo forest and surrounding area.",
    },
  ]);

  return (
    <div>
      <h1>Activities</h1>

      <div className="activities">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
          />
        ))}
      </div>
      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Page1;