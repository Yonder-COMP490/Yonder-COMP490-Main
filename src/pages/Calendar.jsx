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

  const [expandedItinerary, setExpandedItinerary] = useState(false);

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

  function getActivitiesForDate(date) {
    return activities
      .filter((activity) => activity.date === date)
      .sort((a, b) => {
        return (a.startTime || "").localeCompare(a.startTime || "");
      });
  }

  function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return {
      dayName: date.toLocaleDateString("en-US", {
        weekday: "long",
      }),
      monthName: date.toLocaleDateString("en-US", {
        month: "long",
      }),
      dayNumber: date.getDate(),
    };
  }

  /*
   * Creates the dates shown in the expanded itinerary.
   *
   * This currently shows the entire current month.
   * Later, this could easily be changed to show the whole trip.
   */
  function getExpandedDates() {
    const dates = [];

    // Collect every date that represents part of the trip
    const tripDates = [];

    activities.forEach((activity) => {
      if (activity.date) {
        tripDates.push(activity.date);
      }
    });

    housing.forEach((housingItem) => {
      if (housingItem.checkInDate) {
        tripDates.push(housingItem.checkInDate);
      }

      if (housingItem.checkOutDate) {
        tripDates.push(housingItem.checkOutDate);
      }
    });

    // No trip data
    if (tripDates.length === 0) {
      return dates;
    }

    // Find first and last date
    const firstDate = new Date(
      Math.min(
        ...tripDates.map((date) =>
          new Date(date + "T00:00:00").getTime()
        )
      )
    );

    const lastDate = new Date(
      Math.max(
        ...tripDates.map((date) =>
          new Date(date + "T00:00:00").getTime()
        )
      )
    );

    // Generate every day from first -> last
    const currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      const dateString =
        `${currentDate.getFullYear()}-` +
        `${String(currentDate.getMonth() + 1).padStart(2, "0")}-` +
        `${String(currentDate.getDate()).padStart(2, "0")}`;

      dates.push(dateString);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
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

  const selectedActivities = getActivitiesForDate(selectedDate);
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

  /*
   * Render the contents of a single day's itinerary.
   * This is used by both the normal and expanded views.
   */
  function renderDayContents(date) {
    const dayActivities = getActivitiesForDate(date);
    const dayHousing = getHousingForDate(date);

    return (
      <>
        {/* Housing */}
        {dayHousing.map((housingItem) => {
          const isCheckIn =
            date === housingItem.checkInDate;

          const isCheckOut =
            date === housingItem.checkOutDate;

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
        {dayActivities.map((activity) => (
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
        ))}

        {dayActivities.length === 0 &&
          dayHousing.length === 0 && (
            <p className="no-activities">
              No activities planned.
            </p>
          )}
      </>
    );
  }

  const expandedDates = getExpandedDates();

  return (
    <div
      className={`calendar-page ${
        expandedItinerary ? "itinerary-expanded" : ""
      }`}
    >
      {!expandedItinerary && (
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
      )}

      {!expandedItinerary ? (
        /* Normal single-day itinerary */
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

          <button
            className="expand-itinerary-button"
            onClick={() => setExpandedItinerary(true)}
          >
            Expand Itinerary
          </button>

          <div className="itinerary-body">
            {renderDayContents(selectedDate)}
          </div>
        </div>
      ) : (
        /* Expanded itinerary */
        <div className="expanded-itinerary">
          <div className="expanded-itinerary-header">
            <h1>Itinerary</h1>

            <button
              onClick={() => setExpandedItinerary(false)}
            >
              ← Calendar
            </button>
          </div>

          <div className="expanded-itinerary-pages">
            {expandedDates.map((date) => {
              const dateInfo = formatDate(date);

              return (
                <div
                  className={`itinerary-page ${
                    date === selectedDate
                      ? "current-itinerary-page"
                      : ""
                  }`}
                  key={date}
                >
                  <div className="itinerary-page-header">
                    <h2>{dateInfo.dayName}</h2>

                    <p>
                      {dateInfo.monthName}{" "}
                      {dateInfo.dayNumber}
                    </p>
                  </div>

                  <div className="itinerary-page-body">
                    {renderDayContents(date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link to="/" className="home-button">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Calendar;