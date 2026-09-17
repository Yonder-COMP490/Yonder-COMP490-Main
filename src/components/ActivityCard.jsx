function ActivityCard({ activity }) {
  return (
    <div className="activity-card">
        <div>
        <h2>{activity.name}</h2>
        <p>{activity.date}</p>
        <p>{activity.description}</p>
        </div>
    </div>
  );
}

export default ActivityCard;