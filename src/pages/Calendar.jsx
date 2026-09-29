import { useState } from "react";
import { Link } from "react-router-dom";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import "./Calendar.css";

function Calendar() {
  const { activities } = useActivities();
  const { housing } = useHousing();

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState(
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`
  );

  function changeMonth(amount) {
    let newMonth = currentMonth + amount;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function changeDay(amount) {
    const date = new Date(selectedDate + "T00:00:00");

    date.setDate(date.getDate() + amount);

    const newDate =
      `${date.getFullYear()}-` +
      `${String(date.getMonth() + 1).padStart(2, "0")}-` +
      `${String(date.getDate()).padStart(2, "0")}`;

    setSelectedDate(newDate);

    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function getDateString(day) {
    return (
      `${currentYear}-` +
      `${String(currentMonth + 1).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`
    );
  }

  function hasActivity(date) {
    return activities.some((activity) => activity.date === date);
  }

  function hasHousing(date) {
    return housing.some(
      (housingItem) =>
        date >= housingItem.checkInDate &&
        date <= housingItem.checkOutDate
    );
  }

  function getHousingForDate(date) {
    return housing.filter(
      (housingItem) =>
        date >= housingItem.checkInDate &&
        date <= housingItem.checkOutDate
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = [];

  // Empty spaces before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="calendar-day empty"
      ></div>
    );
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = getDateString(day);

    const dayHasActivity = hasActivity(dateString);
    const dayHasHousing = hasHousing(dateString);

    calendarDays.push(
      <button
        key={day}
        className={`calendar-day ${
          dayHasActivity ? "has-activity" : ""
        } ${dayHasHousing ? "has-housing" : ""} ${
          selectedDate === dateString ? "selected" : ""
        }`}
        onClick={() => setSelectedDate(dateString)}
      >
        <span className="calendar-day-number">
          {day}
        </span>

        {dayHasHousing && (
          <div className="housing-line"></div>
        )}
      </button>
    );
  }

  const selectedActivities = activities
    .filter((activity) => activity.date === selectedDate)
    .sort((a, b) => {
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

  const selectedHousing = getHousingForDate(selectedDate);

  const selectedDateObject = new Date(
    selectedDate + "T00:00:00"
  );

  const selectedDayName = selectedDateObject.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
    }
  );

  const selectedMonthName = selectedDateObject.toLocaleDateString(
    "en-US",
    {
      month: "long",
    }
  );

  return (
    <div className="calendar-page">
      <div className="calendar-section">
        <div className="month-header">
          <button onClick={() => changeMonth(-1)}>
            ←
          </button>

          <h1>
            {new Date(
              currentYear,
              currentMonth
            ).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h1>

          <button onClick={() => changeMonth(1)}>
            →
          </button>
        </div>

        <div className="weekday-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="calendar-grid">
          {calendarDays}
        </div>
      </div>

      <div className="itinerary">
        <div className="itinerary-header">
          <button onClick={() => changeDay(-1)}>
            ←
          </button>

          <div>
            <h2>{selectedDayName}</h2>

            <p>
              {selectedMonthName}{" "}
              {selectedDateObject.getDate()}
            </p>
          </div>

          <button onClick={() => changeDay(1)}>
            →
          </button>
        </div>

        <div className="itinerary-body">

          {/* Housing */}
          {selectedHousing.map((housingItem) => {
            const isCheckIn =
              selectedDate === housingItem.checkInDate;

            const isCheckOut =
              selectedDate === housingItem.checkOutDate;

            return (
              <div
                className="itinerary-housing"
                key={housingItem.id}
              >
                <div className="housing-time">
                  {isCheckIn && (
                    <>
                      <strong>Check-in</strong>

                      <span>
                        {housingItem.checkInTime || "--:--"}
                      </span>
                    </>
                  )}

                  {isCheckOut && (
                    <>
                      <strong>Check-out</strong>

                      <span>
                        {housingItem.checkOutTime || "--:--"}
                      </span>
                    </>
                  )}

                  {!isCheckIn && !isCheckOut && (
                    <span>Staying</span>
                  )}
                </div>

                <div className="housing-block">
                  <strong>{housingItem.name}</strong>

                  {!isCheckIn && !isCheckOut && (
                    <span>Staying here</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Activities */}
          {selectedActivities.length === 0 &&
          selectedHousing.length === 0 ? (
            <p className="no-activities">
              No activities planned.
            </p>
          ) : (
            selectedActivities.map((activity) => (
              <div
                className="itinerary-activity"
                key={activity.id}
              >
                <div className="activity-time">
                  {activity.startTime || "--:--"}

                  {activity.endTime && (
                    <span>
                      {" "}
                      - {activity.endTime}
                    </span>
                  )}
                </div>

                <div className="activity-block">
                  {activity.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Link to="/" className="home-button">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Calendar;