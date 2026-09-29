import { useState } from "react";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import Cost from "../components/Cost";
import "./Budget.css";

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

  const [expandedSections, setExpandedSections] = useState({
    activities: true,
    housing: true,
    travel: false,
    daily: false,
  });

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

  function toggleSection(section) {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  }

  return (
    <div className="budget-page">
      <h1 className="budget-title">Budget</h1>

      {/* Activities */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("activities")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.activities ? "▼" : "▶"}
            </span>

            <span>Activities</span>
          </div>

          <span className="budget-section-cost">
            {activityTotal.toString()}
          </span>
        </div>

        {expandedSections.activities && (
          <div className="budget-items">
            {activities.map((activity) => (
              <div
                className="budget-item budget-item-clickable"
                key={activity.id}
              >
                <span className="budget-item-name">
                  {activity.name}
                </span>

                <span className="budget-item-cost">
                  {activity.cost.toString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Housing */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("housing")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.housing ? "▼" : "▶"}
            </span>

            <span>Housing</span>
          </div>

          <span className="budget-section-cost">
            {housingTotal.toString()}
          </span>
        </div>

        {expandedSections.housing && (
          <div className="budget-items">
            {housing.map((housingItem) => {
              const nights = getNumberOfNights(
                housingItem.checkInDate,
                housingItem.checkOutDate
              );

              if (!housingItem.costPerDay) {
                return (
                  <div
                    className="budget-item budget-item-clickable"
                    key={housingItem.id}
                  >
                    <span className="budget-item-name">
                      {housingItem.name}
                    </span>

                    <span className="budget-item-cost">
                      $0
                    </span>
                  </div>
                );
              }

              const totalCost = new Cost(
                housingItem.costPerDay.lowerEnd * nights,
                housingItem.costPerDay.upperEnd * nights,
                housingItem.costPerDay.currency
              );

              return (
                <div
                  className="budget-item budget-item-clickable"
                  key={housingItem.id}
                >
                  <span className="budget-item-name">
                    {housingItem.name}
                  </span>

                  <span className="budget-item-cost">
                    {totalCost.toString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Travel */}
      <div className="budget-section">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("travel")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.travel ? "▼" : "▶"}
            </span>

            <span>Travel</span>
          </div>

          <span className="budget-section-cost">
            $0
          </span>
        </div>

        {expandedSections.travel && (
          <div className="budget-items">
            {/* Travel items will go here */}
          </div>
        )}
      </div>

      {/* Daily */}
      <div className="budget-section budget-daily">
        <div
          className="budget-section-header"
          onClick={() => toggleSection("daily")}
        >
          <div className="budget-section-left">
            <span className="budget-arrow">
              {expandedSections.daily ? "▼" : "▶"}
            </span>

            <span>Daily</span>
          </div>

          <span className="budget-section-cost">
            $0
          </span>
        </div>

        {expandedSections.daily && (
          <div className="budget-items">
            {/* Daily budget items will go here */}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="budget-total">
        <span>Total</span>
        <span>{total.toString()}</span>
      </div>
    </div>
  );
}

export default Budget;