
import { useEffect, useState } from "react";

function formatCost(cost) {
    if (!cost) return "Not set";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: cost.currency || "USD",
    }).format(Number(cost.amount ?? 0));
}

function BackendTest() {
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/api/trip")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Java returned an error.");
                }

                return response.json();
            })
            .then((data) => setTrip(data))
            .catch((err) => setError(err.message));
    }, []);

    if (error) {
        return (
            <div>
                <h2>Java Backend Connection</h2>
                <p>Connection failed: {error}</p>
            </div>
        );
    }

    if (!trip) {
        return <p>Loading trip from Java...</p>;
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>{trip.name}</h1>

            <p>
                Trip dates: {trip.startDate} to {trip.endDate}
            </p>

            <h2>Activities</h2>

            {trip.activities?.length ? (
                trip.activities.map((activity) => (
                    <div key={activity.id}>
                        <h3>{activity.name}</h3>
                        <p>Date: {activity.date}</p>
                        <p>Cost: {formatCost(activity.cost)}</p>
                        <p>{activity.notes}</p>
                    </div>
                ))
            ) : (
                <p>No activities.</p>
            )}

            <h2>Housing</h2>

            {trip.housingBookings?.length ? (
                trip.housingBookings.map((housing) => (
                    <div key={housing.id}>
                        <h3>{housing.name}</h3>
                        <p>
                            Check-in: {housing.checkInDate}
                            {" — "}
                            Check-out: {housing.checkOutDate}
                        </p>
                        <p>
                            Nightly cost: {formatCost(housing.costPerDay)}
                        </p>
                        <p>
                            Total cost: {formatCost(housing.totalCost)}
                        </p>
                    </div>
                ))
            ) : (
                <p>No housing bookings.</p>
            )}

            <h2>Budget</h2>

            <p>Activities: {formatCost(trip.activityTotal)}</p>
            <p>Housing: {formatCost(trip.housingTotal)}</p>
            <h3>Total: {formatCost(trip.budgetTotal)}</h3>
        </div>
    );
}

export default BackendTest;
