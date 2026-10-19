import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PlaceCard from "../components/PlaceCard";
import "./Maps.css";

// api key is in .env so it doesnt end up on github
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// our local java server that gets hotels from serpapi (google hotels api) with our key
const HOTELS_URL = "http://localhost:8080/api/hotels";

// hardcoded for now, will add a search bar later
const CITY = "Los Angeles";

// gets a date n days from today, like "2026-11-11"               SerpApi only accepts dates as year-month-day
function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function Maps() {
  // the div the map goes in
  const mapDiv = useRef(null);

  // stuff shown on the page
  const [places, setPlaces] = useState([]);
  const [message, setMessage] = useState("Loading hotels...");

  // load the map when the page opens
  useEffect(() => {
    function startMap() {
      new window.google.maps.Map(mapDiv.current, {
        center: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
        zoom: 12,
      });
    }

    // if google maps already loaded just make the map
    if (window.google?.maps) {
      startMap();
      return;
    }

    // otherwise load the google maps script first
    let script = document.getElementById("google-maps-script");

    if (!script) {
      script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY;
      document.head.appendChild(script);
    }

    script.addEventListener("load", startMap);

    return () => {
      script.removeEventListener("load", startMap);
    };
  }, []);

  // get the hotels from  backend
  useEffect(() => {
    async function loadHotels() {
      const search = new URLSearchParams({
        q: "hotels in " + CITY,
        check_in_date: dateFromToday(1), // tomorrow
        check_out_date: dateFromToday(2), // 1 night
      });

      try {
        const response = await fetch(HOTELS_URL + "?" + search);
        const data = await response.json();

        if (data.error) {
          setMessage("Search failed: " + data.error);
          return;
        }

        // only keep what we need from each hotel
        const hotels = (data.properties || []).map((hotel) => ({
          id: hotel.property_token,
          name: hotel.name,
          rating: hotel.overall_rating,
          reviews: hotel.reviews,
          price: hotel.rate_per_night?.lowest,
          image: hotel.images?.[0]?.thumbnail,
          lat: hotel.gps_coordinates?.latitude,
          lng: hotel.gps_coordinates?.longitude,
        }));

        setPlaces(hotels);
        setMessage("");
      } catch {
        setMessage("Could not reach the hotel server. Is HotelServer running?");
      }
    }

    loadHotels();
  }, []);

  return (
    <div>
      <Link to="/">← Home</Link>

      <div className="maps-page">
        {/* hotel list */}
        <div className="place-list">
          <h2>Hotels in {CITY}</h2>
          <p>{message}</p>

          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>

        {/* map */}
        <div className="map" ref={mapDiv}></div>
      </div>
    </div>
  );
}

export default Maps;
