import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PlaceCard from "../components/PlaceCard";
import "./Maps.css";

// api key is in .env so it doesnt end up on github
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// our local java server that gets hotels from serpapi (google hotels api) with our key
const HOTELS_URL = "http://localhost:8080/api/hotels";

// first city to show
const START_CITY = "San Diego";

// gets a date n days from today, like "2026-11-11"               SerpApi only accepts dates as year-month-day
function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function Maps() {
  // the div the map goes in
  const mapDiv = useRef(null);

  // holds the map
  const mapRef = useRef(null);

  // holds the pins
  const pinsRef = useRef([]);

  // true when the map is loaded
  const [mapReady, setMapReady] = useState(false);

  // city = city being shown, searchText = what's typed in the box
  const [city, setCity] = useState(START_CITY);
  const [searchText, setSearchText] = useState(START_CITY);

  // stuff shown on the page
  const [places, setPlaces] = useState([]);
  const [message, setMessage] = useState("Loading hotels...");

  // load the map when the page opens
  useEffect(() => {
    function startMap() {
      // make the map and save it
      mapRef.current = new window.google.maps.Map(mapDiv.current, {
        center: { lat: 32.7157, lng: -117.1611 }, // San Diego
        zoom: 12,
      });

      // map is ready
      setMapReady(true);
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
  // runs again when city changes
  useEffect(() => {
    // used to skip old searches
    let ignore = false;

    async function loadHotels() {
      const search = new URLSearchParams({
        q: "hotels in " + city,
        check_in_date: dateFromToday(1), // tomorrow
        check_out_date: dateFromToday(2), // 1 night
      });

      try {
        const response = await fetch(HOTELS_URL + "?" + search);
        const data = await response.json();

        // old search, skip it
        if (ignore) return;

        if (data.error) {
          setMessage("Search failed: " + data.error);
          return;
        }

        // only keep what we need from each hotel
        const hotels = (data.properties || []).map((hotel) => ({
          id: hotel.property_token,
          name: hotel.name,
          rating: hotel.overall_rating?.toFixed(1), // 4.653846 -> "4.7"
          reviews: hotel.reviews,
          price: hotel.rate_per_night?.lowest, // ?. means if theres no price, just return undefined instead of crashing
          image: hotel.images?.[0]?.thumbnail,
          lat: hotel.gps_coordinates?.latitude, // hotel pins
          lng: hotel.gps_coordinates?.longitude,
        }));

        setPlaces(hotels);
        setMessage(hotels.length === 0 ? "No hotels found for " + city : "");
      } catch {
        if (ignore) return;
        setMessage("Could not reach the hotel server. Is HotelServer running?");
      }
    }

    loadHotels();

    // city changed, skip this search
    return () => {
      ignore = true;
    };
  }, [city]);

  // add a pin for each hotel
  useEffect(() => {
    // no map yet, so return
    if (!mapReady) return;

    // removes the pins from the last search
    pinsRef.current.forEach((pin) => pin.setMap(null));
    pinsRef.current = [];

    // box that will fit all the pins
    const bounds = new window.google.maps.LatLngBounds();

    places.forEach((place) => {
      // skip if no location
      if (!place.lat || !place.lng) return;

      // make a pin
      const pin = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapRef.current,
        title: place.name, // name on hover
      });

      pinsRef.current.push(pin);
      bounds.extend(pin.getPosition());
    });

    // zoom map to fit the pins
    if (pinsRef.current.length > 0) {
      mapRef.current.fitBounds(bounds);
    }
  }, [places, mapReady]);

  // runs when you click Search
  function handleSearch(event) {
    // stop page reload
    event.preventDefault();

    // remove extra spaces
    const newCity = searchText.trim();

    // skip if empty or same city
    if (newCity === "" || newCity === city) return;

    // clear old hotels
    setPlaces([]);
    setMessage("Loading hotels...");

    // new city = new search
    setCity(newCity);
  }

  return (
    <div>
      <Link to="/">← Home</Link>

      <div className="maps-page">
        {/* hotel list */}
        <div className="place-list">
          {/* search bar */}
          <form className="city-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter a city"
              value={searchText}
              // save what you type
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <h2>Hotels in {city}</h2>
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
