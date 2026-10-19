function ActivityCard({ activity, onEdit }) {
  const cost = activity.cost;

  function formatCost() {
    if (!cost) return "";

    const lower = Number(cost.lowerEnd ?? 0);
    const upper = Number(cost.upperEnd ?? lower);

    const amount =
      lower === upper ? `${lower}` : `${lower}-${upper}`;

    return `${amount} ${cost.currency || "USD"}`;
  }

  return (
    <div className="activity-card">
      <h2>{activity.name}</h2>

      {activity.picture && (
        <img src={activity.picture} alt={activity.name} />
      )}

      <p>{activity.date}</p>

      <p>
        {activity.startTime}
        {activity.startTime && activity.endTime && " - "}
        {activity.endTime}
      </p>

      <p>{formatCost()}</p>

      <p className="activity-notes">{activity.notes}</p>

      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

export default ActivityCard;