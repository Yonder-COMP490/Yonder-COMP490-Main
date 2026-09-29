import { useState } from "react";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import { useBudget } from "../components/BudgetContext";
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
  const { budgetItems, addBudgetItem } = useBudget();

  const [expandedSections, setExpandedSections] = useState({
    activities: true,
    housing: true,
    travel: false,
    daily: false,
  });

  const [addingDailyItem, setAddingDailyItem] = useState(false);

  const [dailyName, setDailyName] = useState("");
  const [dailyCost, setDailyCost] = useState("");
  const [dailyDays, setDailyDays] = useState("");

  const activityTotal = new Cost();
  const housingTotal = new Cost();
  const dailyTotal = new Cost();

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

  budgetItems.forEach((item) => {
    const itemTotal = new Cost(
      item.cost.lowerEnd * item.days,
      item.cost.upperEnd * item.days,
      item.cost.currency
    );

    dailyTotal.addCost(itemTotal);
  });

  const total = new Cost();

  total.addCost(activityTotal);
  total.addCost(housingTotal);
  total.addCost(dailyTotal);

  function toggleSection(section) {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  }

  function handleAddDailyItem() {
    if (!dailyName || !dailyCost || !dailyDays) {
      return;
    }

    const cost = new Cost(
      Number(dailyCost),
      Number(dailyCost),
      "USD"
    );

    addBudgetItem(
      dailyName,
      cost,
      Number(dailyDays)
    );

    setDailyName("");
    setDailyCost("");
    setDailyDays("");
    setAddingDailyItem(false);
  }

  function cancelAddDailyItem() {
    setDailyName("");
    setDailyCost("");
    setDailyDays("");
    setAddingDailyItem(false);
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
      <div className="budget-section">
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
            {dailyTotal.toString()}
          </span>
        </div>

        {expandedSections.daily && (
          <div className="budget-items">
            {budgetItems.map((item) => {
              const totalCost = new Cost(
                item.cost.lowerEnd * item.days,
                item.cost.upperEnd * item.days,
                item.cost.currency
              );

              return (
                <div
                  className="budget-item"
                  key={item.id}
                >
                  <span className="budget-item-name">
                    {item.name}
                  </span>

                  <span className="budget-item-cost">
                    {totalCost.toString()}
                    {" "}
                    ({item.days} days × {item.cost.toString()})
                  </span>
                </div>
              );
            })}

            {!addingDailyItem && (
              <button
                className="budget-add-button"
                onClick={() => setAddingDailyItem(true)}
              >
                + Add Daily Item
              </button>
            )}

            {addingDailyItem && (
              <div className="budget-add-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={dailyName}
                  onChange={(e) => setDailyName(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Cost"
                  min="0"
                  value={dailyCost}
                  onChange={(e) => setDailyCost(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Days"
                  min="1"
                  value={dailyDays}
                  onChange={(e) => setDailyDays(e.target.value)}
                />

                <button onClick={handleAddDailyItem}>
                  Add
                </button>

                <button onClick={cancelAddDailyItem}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="budget-total">
        <span>Total</span>

        <span>
          {total.toString()}
        </span>
      </div>
    </div>
  );
}

export default Budget;
