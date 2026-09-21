function ActivityCard({ activity, onEdit }) {
  return (
    <div className="activity-card">
      <h2>{activity.name}</h2>

      {activity.picture && (
        <img
          src={activity.picture}
          alt={activity.name}
        />
      )}

      <p>{activity.date}</p>

      <p>
        {activity.startTime}
        {activity.startTime && activity.endTime && " - "}
        {activity.endTime}
      </p>

      <p>{activity.cost}</p>

      <p className="activity-notes">
        {activity.notes}
      </p>

      <button onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}

export default ActivityCard;