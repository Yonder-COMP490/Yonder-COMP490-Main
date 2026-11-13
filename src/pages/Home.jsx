/**
 * Component name: Home
 * Date: 11/02/2026
 * Programmer: Andrew Garcia
 * Description: Displays the Yonder home page, including user information,
 * the current trip dashboard link, and suggested travel destinations.
 * Retrieves user and trip information from the backend.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const API_BASE = "http://localhost:8080/api";

const suggestions = [
  {
    id: "lisbon",
    name: "Take the slow road to Lisbon",
    category: "SOMEWHERE NEW",
    location: "Lisbon, Portugal",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "dolomites",
    name: "A walk above the clouds",
    category: "THE GREAT OUTDOORS",
    location: "The Dolomites, Italy",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "kyoto",
    name: "Tea, with a side of stillness",
    category: "A LOCAL EXPERIENCE",
    location: "Kyoto, Japan",
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "copenhagen",
    name: "An afternoon by the water",
    category: "A CITY TO GET LOST IN",
    location: "Copenhagen, Denmark",
    image:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=900&auto=format&fit=crop&q=80",
  },
];

/**
 * Selects a destination image based on the trip name.
 *
 * @param {Object} trip - The trip used to determine the destination image.
 * @returns {string} The URL of the selected trip image.
 */
function getTripImage(trip) {
  const name = (trip.name || "").toLowerCase();

  if (name.includes("japan") || name.includes("kyoto")) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=85";
  }

  if (name.includes("italy") || name.includes("rome")) {
    return "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=85";
  }

  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=85";
}

/**
 * Formats a trip's start and end dates into a readable date range.
 *
 * @param {string} startDate - The trip's starting date.
 * @param {?string} endDate - The trip's ending date.
 * @returns {string} The formatted date range, or a message if dates are unset.
 */
function formatTripDates(startDate, endDate) {
  if (!startDate) return "Dates not set";

  const format = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return endDate
    ? `${format(startDate)} – ${format(endDate)}`
    : format(startDate);
}

/**
 * Component name: Home
 * Description: Renders the main Yonder landing page. Loads the user's
 * information and current trip from the backend, displays trip details,
 * provides navigation to the dashboard and profile, and showcases
 * suggested travel destinations.
 *
 * @returns {JSX.Element} The Yonder home page.
 */
function Home() {
  const [username, setUsername] = useState("");
  const [trip, setTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    async function loadUserInfo() {
      try {
        const response = await fetch(`${API_BASE}/userinfo`);

        if (!response.ok) return;

        const text = await response.text();
        if (!text.trim()) return;

        const userInfo = JSON.parse(text);
        if (userInfo?.username) {
          setUsername(userInfo.username);
        }
      } catch (error) {
        console.error("Could not load user information:", error);
      }
    }

    async function loadTrip() {
      try {
        const response = await fetch(`${API_BASE}/trip`);

        if (!response.ok) {
          throw new Error(`Trip request failed (${response.status})`);
        }

        const data = await response.json();
        setTrip(data && data.id != null ? data : null);
      } catch (error) {
        setTripError("Unable to load trips. Check the backend connection.");
        console.error("Could not load trip:", error);
      } finally {
        setTripLoading(false);
      }
    }

    loadUserInfo();
    loadTrip();
  }, []);

  const displayName = username || "Traveler";

  return (
    <div className="yonder-home">
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-logo">
            <span className="home-logo-symbol">✧</span>
            Yonder<span className="home-logo-period">.</span>
          </Link>

          <nav className="home-navigation" aria-label="Main navigation">
            <a href="#home" className="home-nav-active">
              Home
            </a>
            <a href="#my-trips">My trips</a>
            <a href="#inspiration">Explore</a>
          </nav>

          <div className="home-account">
            <span className="home-username">{displayName}</span>

            <button
              type="button"
              className="home-profile-button"
              aria-label="Account menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              ☰
            </button>

            {profileOpen && (
              <div className="home-profile-menu">
                <Link to="/userinfo" onClick={() => setProfileOpen(false)}>
                  Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="home" className="home-main">
        <section className="home-welcome">
          <p className="home-eyebrow">
            A LITTLE PLANNING, A WORLD OF POSSIBILITY
          </p>

          <h1>Welcome to Yonder.</h1>

          <p>
            Pick up where you left off, or let somewhere new catch your eye.
          </p>
        </section>

        <section
          id="my-trips"
          className="home-section"
          aria-labelledby="home-trips-title"
        >
          <div className="home-section-header">
            <div>
              <h2 id="home-trips-title">Journeys in the making</h2>
              <p>Your adventures, all in one place.</p>
            </div>
          </div>

          {tripError && (
            <p role="alert" className="home-error">
              {tripError}
            </p>
          )}

          {tripLoading ? (
            <p className="home-loading">Loading your trips...</p>
          ) : (
            <div className="home-trips-grid">
              {trip && (
                <Link
                  to="/dashboard"
                  className="home-trip-card"
                  aria-label={`Open ${trip.name} dashboard`}
                >
                  <div className="home-trip-image">
                    <img
                      src={getTripImage(trip)}
                      alt={`${trip.name} destination`}
                    />
                    <span className="home-trip-status">
                      Itinerary in progress
                    </span>
                  </div>

                  <div className="home-trip-information">
                    <div className="home-trip-title-row">
                      <h3>{trip.name}</h3>
                      <span aria-hidden="true">↗</span>
                    </div>

                    <p>
                      {formatTripDates(trip.startDate, trip.endDate)}
                    </p>

                    <div className="home-trip-details">
                      <span>
                        {trip.activities?.length ?? 0} activities
                      </span>
                      <span>
                        {trip.housingBookings?.length ?? 0} stays
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="home-create-trip" aria-label="Plan a new trip">
                <div className="home-create-icon">+</div>
                <h3>Plan a new trip</h3>
                <p>Every great adventure starts with a little idea.</p>
                <span className="home-coming-soon">
                  Trip creation coming soon
                </span>
              </div>
            </div>
          )}

          {!tripLoading && !trip && !tripError && (
            <p className="home-empty">
              You don't have any trips yet.
            </p>
          )}
        </section>

        <section
          id="inspiration"
          className="home-section home-inspiration"
          aria-labelledby="home-inspiration-title"
        >
          <div className="home-section-header">
            <div>
              <h2 id="home-inspiration-title">
                A little inspiration for the road
              </h2>
              <p>Places to fall for. Ideas for your next adventure.</p>
            </div>
          </div>

          <div className="home-inspiration-grid">
            {suggestions.map((destination) => (
              <article
                key={destination.id}
                className="home-destination-card"
              >
                <div className="home-destination-image">
                  <img
                    src={destination.image}
                    alt={destination.location}
                    loading="lazy"
                  />
                </div>

                <div className="home-destination-details">
                  <p className="home-destination-category">
                    {destination.category}
                  </p>

                  <h3>{destination.name}</h3>

                  <p className="home-destination-location">
                    ♧ {destination.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span>© {new Date().getFullYear()} Yonder</span>
        <span>A little planning goes a long way.</span>
      </footer>
    </div>
  );
}

export default Home;
