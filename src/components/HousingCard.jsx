function HousingCard({ housing, onEdit }) {
  return (
    <div className="housing-card">
      <h2>{housing.name}</h2>

      <p>
        Check-in:{" "}
        {housing.checkInDate}
        {housing.checkInTime && ` at ${housing.checkInTime}`}
      </p>

      <p>
        Check-out:{" "}
        {housing.checkOutDate}
        {housing.checkOutTime && ` at ${housing.checkOutTime}`}
      </p>

      <p>
        {housing.costPerDay?.toString()} / day
      </p>

      <button onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}

export default HousingCard;