import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import Cost from "../components/Cost";

function getNumberOfNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return 0;
  }

  const checkIn = new Date(checkInDate + "T00:00:00");
  const checkOut = new Date(checkOutDate + "T00:00:00");

  const difference = checkOut - checkIn;

  return Math.max(
    0,
    Math.round(difference / (1000 * 60 * 60 * 24))
  );
}

function Budget() {
  const { activities } = useActivities();
  const { housing } = useHousing();

  const activityTotal = new Cost();
  const housingTotal = new Cost();


  activities.forEach((activity) => {
    activityTotal.addCost(activity.cost);
  });
    housing.forEach((housingItem) => {
    const nights = getNumberOfNights(
      housingItem.checkInDate,
      housingItem.checkOutDate
    );

    if (housingItem.costPerDay) {
      const housingCost = new Cost(
        housingItem.costPerDay.lowerEnd * nights,
        housingItem.costPerDay.upperEnd * nights,
        housingItem.costPerDay.currency
      );

      housingTotal.addCost(housingCost);
    }
  });
  const total = new Cost();
  total.addCost(activityTotal);
  total.addCost(housingTotal);

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

      <h2>Housing</h2>

      {housing.map((housingItem) => {
        const nights = getNumberOfNights(
          housingItem.checkInDate,
          housingItem.checkOutDate
        );

        const totalCost = new Cost(
          housingItem.costPerDay.lowerEnd * nights,
          housingItem.costPerDay.upperEnd * nights,
          housingItem.costPerDay.currency
        );

        return (
          <div key={housingItem.id}>
            <span>{housingItem.name}: </span>

            <span>
              {totalCost.toString()}
              {" "}
              ({nights} nights ×{" "}
              {housingItem.costPerDay.toString()}/day)
            </span>
          </div>
        );
      })}

      <h2>Activities Total: {activityTotal.toString()}</h2>

      <h2>Housing Total: {housingTotal.toString()}</h2>

      <h2>Total: {total.toString()}</h2>
    </div>
  );
}

export default Budget;