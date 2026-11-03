import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import PlaceCard from "../components/PlaceCard";
import "./Maps.css";

// api key is in .env so it doesnt end up on github
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// price bubbles need a map id. if there's none in .env, use google's free test one
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// how far to slide the popup card so it sits next to its bubble and stays inside the map
function findPopupShift(hotelId, mapEl, popupDiv) {
  const bubble = document.getElementById("pin-" + hotelId);
  const card = popupDiv.querySelector(".map-popup");
  if (!bubble || !card) return { x: 0, y: 0 };

  const b = bubble.getBoundingClientRect();
  const m = mapEl.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  const gap = 8; // space around the card

  const fitsRight = b.right + gap + c.width <= m.right - gap;
  const fitsLeft = b.left - gap - c.width >= m.left + gap;

  let left;
  let top;

  // right side first, then left, lined up with the middle of the bubble
  if (fitsRight || fitsLeft) {
    left = fitsRight ? b.right + gap : b.left - gap - c.width;
    top = b.top + b.height / 2 - c.height / 2;
  } else {
    // no room on either side, so go under the bubble (or above if there's no room under)
    left = b.left + b.width / 2 - c.width / 2;
    top = b.bottom + gap;
    if (top + c.height > m.bottom - gap) top = b.top - gap - c.height;
  }

  // keep the whole card inside the map
  left = clamp(left, m.left + gap, m.right - gap - c.width);
  top = clamp(top, m.top + gap, m.bottom - gap - c.height);

  // the card starts with its bottom middle on the hotel, same as the bubble
  const startLeft = b.left + b.width / 2 - c.width / 2;
  const startTop = b.bottom - c.height;

  return { x: left - startLeft, y: top - startTop };
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

  // hotel highlighted in the list and on the map (null = none)
  const [selectedId, setSelectedId] = useState(null);

  // hotel whose popup card is open (null = none)
  const [openId, setOpenId] = useState(null);

  // the map pin and div that hold the popup card
  const popupPinRef = useRef(null);
  const [popupDiv] = useState(() => document.createElement("div"));

  // hotels already clicked (grey bubbles)
  const [visitedIds, setVisitedIds] = useState(new Set());

  // how far to slide the popup card so it fits, and which hotel that was measured for
  const [popupShift, setPopupShift] = useState(null);

  // load the map when the page opens
  useEffect(() => {
    function startMap() {
      // make the map and save it
      mapRef.current = new window.google.maps.Map(mapDiv.current, {
        center: { lat: 32.7157, lng: -117.1611 }, // San Diego
        zoom: 12,
        mapId: MAP_ID,
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
      script.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&libraries=marker"; // marker = the price bubble tools
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
    pinsRef.current.forEach((pin) => (pin.map = null));
    pinsRef.current = [];

    // box that will fit all the pins
    const bounds = new window.google.maps.LatLngBounds();

    places.forEach((place) => {
      // skip if no location
      if (!place.lat || !place.lng) return;

      // make a pin
      const position = { lat: place.lat, lng: place.lng };

      // white bubble with the price, like "$193"
      const bubble = document.createElement("div");
      bubble.className = "price-pin";
      bubble.textContent = place.price || "No price";
      bubble.id = "pin-" + place.id; // so we can find it later

      // AdvancedMarkerElement lets the pin show our own html (the bubble)
      const pin = new window.google.maps.marker.AdvancedMarkerElement({
        position: position,
        map: mapRef.current,
        title: place.name, // name on hover
        content: bubble,
      });

      // clicking the bubble picks this hotel
      pin.addListener("click", () => {
        setSelectedId(place.id);
        setOpenId(place.id);
        setVisitedIds((old) => new Set(old).add(place.id));
      });

      pinsRef.current.push(pin);
      bounds.extend(position);
    });

    // zoom map to fit the pins
    if (pinsRef.current.length > 0) {
      mapRef.current.fitBounds(bounds);
    }
  }, [places, mapReady]);

  // highlight the picked hotel's bubble and scroll the list to its card
  useEffect(() => {
    document
      .querySelectorAll(".price-pin")
      .forEach((bubble) => bubble.classList.remove("selected"));

    if (!selectedId) return;

    const bubble = document.getElementById("pin-" + selectedId);
    if (bubble) bubble.classList.add("selected");

    const card = document.getElementById("card-" + selectedId);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId, places]);

  // turn the bubbles you already clicked grey
  useEffect(() => {
    visitedIds.forEach((id) => {
      const bubble = document.getElementById("pin-" + id);
      if (bubble) bubble.classList.add("visited");
    });
  }, [visitedIds, places]);

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
    // nothing picked, open or grey in the new city yet
    setSelectedId(null);
    setOpenId(null);
    setVisitedIds(new Set());

    // new city = new search
    setCity(newCity);
  }

  // the hotel shown in the popup card (undefined if none)
  const openPlace = places.find((place) => place.id === openId);

  // only use the shift if it was measured for the hotel that's open now
  const shift = popupShift && popupShift.id === openId ? popupShift : null;

  // put the popup card on the map at the open hotel, or hide it
  useEffect(() => {
    if (!mapReady) return;

    // make the popup pin the first time
    if (!popupPinRef.current) {
      popupPinRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        content: popupDiv,
        zIndex: 1000, // above the price bubbles
      });
    }

    const popupPin = popupPinRef.current;

    if (!openPlace || !openPlace.lat || !openPlace.lng) {
      popupPin.map = null;
      return;
    }

    popupPin.position = { lat: openPlace.lat, lng: openPlace.lng };
    popupPin.map = mapRef.current;

    // wait a frame for the card to draw, then measure where it fits
    const frame = requestAnimationFrame(() => {
      setPopupShift({ id: openPlace.id, ...findPopupShift(openPlace.id, mapDiv.current, popupDiv) });
    });

    return () => cancelAnimationFrame(frame);
  }, [openPlace, mapReady, popupDiv]);

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
            <PlaceCard
              key={place.id}
              place={place}
              selected={place.id === selectedId}
              onHover={() => setSelectedId(place.id)}
              // clicking a card opens its popup (map stays still)
              onClick={() => {
                setSelectedId(place.id);
                setOpenId(place.id);
                setVisitedIds((old) => new Set(old).add(place.id));
              }}
            />
          ))}
        </div>

        {/* map */}
        {/* map, with the popup card on top of it */}
        <div className="map-area">
          <div className="map" ref={mapDiv}></div>

          {/* popup card, drawn inside its map pin with createPortal */}
          {openPlace && createPortal(
            <div
              className="map-popup"
              // hidden until we know where it fits
              style={{
                transform: shift ? `translate(${shift.x}px, ${shift.y}px)` : "none",
                visibility: shift ? "visible" : "hidden",
              }}
            >
              <button className="popup-close" onClick={() => setOpenId(null)}>
                ✕
              </button>

              {openPlace.image && <img src={openPlace.image} alt={openPlace.name} />}

              <div className="popup-info">
                <h3>{openPlace.name}</h3>
                {openPlace.rating && (
                  <p>
                    ★ {openPlace.rating} ({openPlace.reviews} reviews)
                  </p>
                )}
                <p className="price">
                  {openPlace.price ? `${openPlace.price} / night` : "Price not available"}
                </p>
              </div>
            </div>,
            popupDiv
          )}
        </div>
      </div>
    </div>
  );
}

export default Maps;
