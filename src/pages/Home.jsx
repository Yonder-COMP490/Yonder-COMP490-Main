
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateTripForm from "../components/CreateTripForm";
import "./Home.css";

const API_BASE = "http://localhost:8080/api";

/**
 * Curated destinations displayed in the homepage inspiration section.
 * Each entry provides a title, category, location, and image URL.
 *
 * @type {Array<{id: string, name: string, category: string, location: string, image: string}>}
 */
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
 * Chooses a trip card image using keywords in the trip name.
 * Falls back to a general travel image when no destination matches.
 *
 * @param {{name: string}} trip - Trip whose card image is needed.
 * @returns {string} URL of the image to display.
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
 * Formats a trip's start date or date range for display.
 * Appending local midnight avoids interpreting date-only strings as UTC.
 *
 * @param {string} startDate - Start date in YYYY-MM-DD format.
 * @param {string} [endDate] - Optional end date in YYYY-MM-DD format.
 * @returns {string} Formatted date range or a missing-date message.
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
    ? `${format(startDate)} - ${format(endDate)}`
    : format(startDate);
}

/**
 * Displays the Yonder homepage and manages trip navigation.
 *
 * Retrieves user information and trips from the backend,
 * displays destination suggestions, and controls the
 * trip creation dialog.
 *
 * @component
 * @author A. Garcia
 * @version 1.0
 * @since 2026-09-16
 */
function Home() {
  const [username, setUsername] = useState("");
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [createTripOpen, setCreateTripOpen] = useState(false);

  /**
   * Loads user information and trips when the homepage mounts.
   * The cancellation flag prevents state updates after unmounting.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadUserInfo() {
      try {
        const response = await fetch(`${API_BASE}/userinfo`);

        if (!response.ok) return;

        const text = await response.text();
        if (!text.trim()) return;

        const userInfo = JSON.parse(text);

        if (!cancelled && userInfo?.username) {
          setUsername(userInfo.username);
        }
      } catch (error) {
        console.error("Could not load user information:", error);
      }
    }

    async function loadTrips() {
      try {
        const response = await fetch(`${API_BASE}/trips`);

        if (!response.ok) {
          throw new Error(`Trip request failed (${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected trip response format.");
        }

        if (!cancelled) {
          setTrips(data);
          setTripError("");
        }
      } catch (error) {
        if (!cancelled) {
          setTripError(
            "Unable to load trips. Check the backend connection."
          );
        }

        console.error("Could not load trips:", error);
      } finally {
        if (!cancelled) {
          setTripLoading(false);
        }
      }
    }

    loadUserInfo();
    loadTrips();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!createTripOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setCreateTripOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [createTripOpen]);

  /**
   * Adds a newly created trip to the displayed list without refetching.
   * Clears any prior trip error and closes the creation dialog.
   *
   * @param {Object} newTrip - Trip returned by the creation form.
   */
  function handleTripCreated(newTrip) {
    setTrips((previousTrips) => [...previousTrips, newTrip]);
    setTripError("");
    setCreateTripOpen(false);
  }

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
            <>
              <div className="home-trips-grid">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    to={`/dashboard?tripId=${trip.id}`}
                    className="home-trip-card"
                    aria-label={`Open ${trip.name} dashboard`}
                  >
                    <div className="home-trip-image">
                      <img
                        src={getTripImage(trip)}
                        alt={`${trip.name} destination`}
                        loading="lazy"
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
                        {formatTripDates(
                          trip.startDate,
                          trip.endDate
                        )}
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
                ))}

                <button
                  type="button"
                  className="home-create-trip"
                  aria-label="Plan a new trip"
                  onClick={() => setCreateTripOpen(true)}
                >
                  <div className="home-create-icon">+</div>

                  <h3>Plan a new trip</h3>

                  <p>
                    Every great adventure starts with a little idea.
                  </p>

                  <span className="home-coming-soon">
                    Start planning
                  </span>
                </button>
              </div>

              {trips.length === 0 && !tripError && (
                <p className="home-empty">
                  You don't have any trips yet. Create your first
                  adventure!
                </p>
              )}
            </>
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

      {createTripOpen && (
        <div
          className="home-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCreateTripOpen(false);
            }
          }}
        >
          <div
            className="home-modal-content"
            role="dialog"
            aria-modal="true"
            aria-label="Create a new trip"
          >
            <button
              type="button"
              className="home-modal-close"
              aria-label="Close create trip form"
              onClick={() => setCreateTripOpen(false)}
            >
              ×
            </button>

            <CreateTripForm
              onCreated={handleTripCreated}
              onCancel={() => setCreateTripOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
