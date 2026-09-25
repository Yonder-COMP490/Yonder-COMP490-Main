import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Maps.css";

function Maps() {
  const mapDiv = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const nextPage = useRef(null);

  // Information shown on the page
  const [places, setPlaces] = useState([]);
  const [showNext, setShowNext] = useState(false);
  const [message, setMessage] = useState("Loading map...");

  // Load the map when the page opens
  useEffect(() => {
    function startMap() {
      if (map.current) return;

      map.current = new window.google.maps.Map(mapDiv.current, {
        center: { lat: 34.2454653, lng: -118.5286373 },
        zoom: 14,
      });

      setMessage("");
    }

    if (window.google?.maps?.places) {
      startMap();
      return;
    }

    let script = document.getElementById("google-maps-script");

    if (!script) {
      script = document.createElement("script");
      script.id = "google-maps-script";
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyDQLMfypzSCBYgbiGSCMM3AZq5Slcc9zMc&libraries=places";
      document.head.appendChild(script);
    }

    script.addEventListener("load", startMap);

    return () => {
      script.removeEventListener("load", startMap);
    };
  }, []);

  // Search for nearby places
  function search(type) {
    if (!map.current) {
      setMessage("Map is still loading.");
      return;
    }

    // Remove old markers
    for (let marker of markers.current) {
      marker.setMap(null);
    }

    markers.current = [];
    nextPage.current = null;
    setPlaces([]);
    setShowNext(false);
    setMessage("Searching...");

    const service = new window.google.maps.places.PlacesService(map.current);

    service.nearbySearch(
      {
        location: map.current.getCenter(),
        radius: 5000,
        type: type,
      },
      showResults,
    );
  }

  // Show Google's results
  function showResults(results, status, page) {
    if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
      setMessage("Search failed: " + status);
      return;
    }

    setMessage("");

    // Add results to the list
    setPlaces((oldPlaces) => [...oldPlaces, ...results]);

    // Add markers to the map
    for (let place of results) {
      if (place.geometry?.location) {
        const marker = new window.google.maps.Marker({
          map: map.current,
          position: place.geometry.location,
          title: place.name,
        });

        markers.current.push(marker);
      }
    }

    nextPage.current = page;

    if (page && page.hasNextPage) {
      setShowNext(true);
    } else {
      setShowNext(false);
    }
  }

  // Get more results
  function loadNextPage() {
    if (nextPage.current && nextPage.current.hasNextPage) {
      setShowNext(false);
      nextPage.current.nextPage();
    }
  }

  return (
    <div>
      <Link to="/">← Home</Link>

      <div className="controls">
        Search Nearby:
        <button onClick={() => search("lodging")}>Hotels</button>
        <button onClick={() => search("restaurant")}>Restaurants</button>
        <button onClick={() => search("tourist_attraction")}>
          Attractions
        </button>
        <button onClick={() => search("car_rental")}>Car Rentals</button>
      </div>

      <div className="container">
        <div className="map" ref={mapDiv}></div>

        <div className="sidebar">
          <h2>Nearby Results</h2>
          <p>{message}</p>

          {places.map((place, index) => (
            <div className="place" key={index}>
              <strong>{place.name}</strong>
              <br />
              {place.vicinity}
            </div>
          ))}

          {showNext && <button onClick={loadNextPage}>Next Page</button>}
        </div>
      </div>
    </div>
  );
}

export default Maps;
