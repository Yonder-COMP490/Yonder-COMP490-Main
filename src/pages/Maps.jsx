/**
 * a) Module name: Maps page
 * b) Date: 9/25/2026 (last updated 11/9/2026)
 * c) Programmer: Alejandro Rivera
 * d) Description: Shows hotels on a Google Map as price bubbles. Has a popup card,
 *    price and rating filters, drag-map search and a "Check availability" button.
 * e) Important functions:
 *    fetchHotels(query, checkIn, checkOut)
 *      Input: search text (like "hotels in San Diego") and trip dates
 *      Output: hotel results (JSON) from our backend
 *    pickHotelInfo(data, searchedIn)
 *      Input: SerpApi hotel JSON and the place searched
 *      Output: a list of simple hotel objects (name, price, rating, location)
 *    passesFilters(place, maxPrice, minRating)
 *      Input: one hotel and the filter values
 *      Output: true to show the hotel, false to hide it
 *    bookingLink(place)
 *      Input: one hotel
 *      Output: the hotel's website, or a Google search link if it has none
 * f) Data structures: an array of hotel objects (places), and a Set of hotel ids
 *    the user already clicked (visitedIds) so those pins turn grey.
 * g) Algorithm: distanceKm() uses a simple flat-map distance formula to check if the
 *    map moved more than 1.5 km before searching again. It's simpler than the full
 *    Haversine formula and accurate enough for short distances.
 */
import { useEffect, useMemo, useRef, useState } from "react";
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

// only search again if the map moved at least this far, to save searches
const MIN_DRAG_KM = 1.5;

// how long to wait after a drag before searching, in case you drag again
const DRAG_WAIT_MS = 800;

// our local java server that has the current trip
const TRIP_URL = "http://localhost:8080/api/trip";

// gets the dates to search: the trip's dates, or tomorrow for 1 night if the trip can't be used
async function fetchSearchDates() {
  const tomorrow = dateFromToday(1);
  const nextDay = dateFromToday(2);

  try {
    const response = await fetch(TRIP_URL);
    const trip = await response.json();

    // dates look like "2027-04-01", so comparing them as text works
    if (trip.startDate >= tomorrow && trip.endDate > trip.startDate) {
      return { checkIn: trip.startDate, checkOut: trip.endDate };
    }
  } catch {
    // no trip to read, so use tomorrow below
  }

  return { checkIn: tomorrow, checkOut: nextDay };
}

// turns "2027-04-01" into "Apr 1"
function shortDate(text) {
  const date = new Date(text + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// where the Check availability button goes: the hotel's own site, or a Google search if it has none
function bookingLink(place) {
  if (place.link && place.link.startsWith("http")) return place.link;

  const words = place.name + " " + place.searchedIn + " book";
  return "https://www.google.com/search?" + new URLSearchParams({ q: words });
}

// asks our server for hotels and gives back everything it found
async function fetchHotels(query, checkIn, checkOut) {
  const search = new URLSearchParams({
    q: query,
    check_in_date: checkIn,
    check_out_date: checkOut,
  });

  const response = await fetch(HOTELS_URL + "?" + search);
  return response.json();
}

// only keep what we need from each hotel
// searchedIn = the place we searched, so the Google link can name it
function pickHotelInfo(data, searchedIn) {
  return (data.properties || []).map((hotel) => ({
    id: hotel.property_token,
    link: hotel.link,
    searchedIn: searchedIn,
    totalPrice: hotel.total_rate?.lowest,
    name: hotel.name,
    rating: hotel.overall_rating?.toFixed(1), // 4.653846 -> "4.7"
    reviews: hotel.reviews,
    price: hotel.rate_per_night?.lowest, // ?. means if theres no price, just return undefined instead of crashing
    image: hotel.images?.[0]?.thumbnail,
    lat: hotel.gps_coordinates?.latitude, // hotel pins
    lng: hotel.gps_coordinates?.longitude,
  }));
}

// about how many km apart two spots on the map are
function distanceKm(a, b) {
  const kmNorth = (a.lat - b.lat) * 111; // 1 degree of latitude is about 111 km
  const kmEast = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(kmNorth * kmNorth + kmEast * kmEast);
}

// turns a spot on the map into a name like "La Jolla, San Diego, CA"
// gives back null if there's no city there, like out in the ocean
async function findAreaName(center) {
  const geocoder = new window.google.maps.Geocoder();
  const answer = await geocoder.geocode({ location: center });
  const parts = answer.results[0].address_components;

  // finds one piece of the address, like the city
  function getPart(type) {
    const part = parts.find((item) => item.types.includes(type));
    return part ? part.short_name : null;
  }

  const city = getPart("locality");
  const state = getPart("administrative_area_level_1");
  if (!city || !state) return null;

  const neighborhood = getPart("neighborhood");
  if (neighborhood) return neighborhood + ", " + city + ", " + state;
  return city + ", " + state;
}

// turns a price like "$1,193" into the number 1193
function priceToNumber(price) {
  return Number(price.replace(/[^0-9.]/g, ""));
}

// checks one hotel against the filters. true = show it, false = hide it
function passesFilters(place, maxPrice, minRating) {
  // "" means no max price was typed
  if (maxPrice !== "") {
    if (!place.price) return false;
    if (priceToNumber(place.price) > Number(maxPrice)) return false;
  }

  // "0" means "Any" rating
  if (minRating !== "0") {
    if (!place.rating) return false;
    if (Number(place.rating) < Number(minRating)) return false;
  }

  return true;
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

  // what's picked in the filter boxes
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");

  // the dates we search hotels for (null = not loaded yet)
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  // small note on the map, like "Loading hotels in this area..." ("" = no note)
  const [areaNote, setAreaNote] = useState("");

  // true when the next hotels to load should zoom the map (only for a city search)
  const shouldZoomRef = useRef(true);

  // the last spot we searched, and the area names we already searched
  const lastCenterRef = useRef(null);
  const searchedAreasRef = useRef(new Set());

  // goes up with every search, so we can ignore answers from an older one
  const searchIdRef = useRef(0);

  // the hotels that match the filters. places always keeps every hotel
  // useMemo only redoes this when a filter or the hotels change, so the pins don't redraw on every click
  const shownPlaces = useMemo(() => {
    return places.filter((place) => passesFilters(place, maxPrice, minRating));
  }, [places, maxPrice, minRating]);

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

  // find out which dates to search when the page opens
  useEffect(() => {
    async function loadDates() {
      const dates = await fetchSearchDates();
      setCheckIn(dates.checkIn);
      setCheckOut(dates.checkOut);
    }

    loadDates();
  }, []);

  // get the hotels from  backend
  // runs again when city changes
  useEffect(() => {
    // wait until we know the dates
    if (!checkIn) return;

    // used to skip old searches
    let ignore = false;

    async function loadHotels() {
      try {
        const data = await fetchHotels("hotels in " + city, checkIn, checkOut);

        // old search, skip it
        if (ignore) return;

        if (data.error) {
          setMessage("Search failed: " + data.error);
          return;
        }

        const hotels = pickHotelInfo(data, city);

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
  }, [city, checkIn, checkOut]);

  // add a pin for each hotel
  useEffect(() => {
    // no map yet, so return
    if (!mapReady) return;

    // removes the pins from the last search
    pinsRef.current.forEach((pin) => (pin.map = null));
    pinsRef.current = [];

    shownPlaces.forEach((place) => {
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
    });
  }, [shownPlaces, mapReady]);

  // only zooms for a new city, so the map stays still for filters and drags
  useEffect(() => {
    if (!mapReady || !shouldZoomRef.current || places.length === 0) return;
    shouldZoomRef.current = false;

    // box that will fit all the pins
    const bounds = new window.google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;
      bounds.extend({ lat: place.lat, lng: place.lng });
    });

    // zoom map to fit the pins
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  }, [places, mapReady]);

  // after you drag the map, find hotels around the new spot and add them
  useEffect(() => {
    if (!mapReady || !checkIn) return;

    let dragTimer;

    function currentCenter() {
      const center = mapRef.current.getCenter();
      return { lat: center.lat(), lng: center.lng() };
    }

    async function searchThisArea() {
      const center = currentCenter();

      // barely moved, so save a search
      if (distanceKm(lastCenterRef.current, center) < MIN_DRAG_KM) return;
      lastCenterRef.current = center;

      searchIdRef.current += 1;
      const thisSearch = searchIdRef.current;
      setAreaNote("Loading hotels in this area...");

      try {
        const areaName = await findAreaName(center);

        // nothing to search here, or we already did this area
        if (!areaName || searchedAreasRef.current.has(areaName)) {
          if (thisSearch === searchIdRef.current) setAreaNote("");
          return;
        }
        searchedAreasRef.current.add(areaName);

        const data = await fetchHotels("hotels in " + areaName, checkIn, checkOut);

        // you dragged again or searched a city while this one was loading
        if (thisSearch !== searchIdRef.current) return;

        if (data.error) {
          setAreaNote("Could not load hotels in this area");
          return;
        }

        // keep the old hotels and add only the ones we don't have yet
        const newHotels = pickHotelInfo(data, areaName);
        setPlaces((oldHotels) => {
          const oldIds = new Set(oldHotels.map((hotel) => hotel.id));
          return [...oldHotels, ...newHotels.filter((hotel) => !oldIds.has(hotel.id))];
        });
        setAreaNote("");
      } catch {
        if (thisSearch === searchIdRef.current) {
          setAreaNote("Could not load hotels in this area");
        }
      }
    }

    // remember where the map was before the very first drag
    const startListener = mapRef.current.addListener("dragstart", () => {
      clearTimeout(dragTimer);
      if (!lastCenterRef.current) lastCenterRef.current = currentCenter();
    });

    // wait a moment after the drag ends, then search
    const endListener = mapRef.current.addListener("dragend", () => {
      clearTimeout(dragTimer);
      dragTimer = setTimeout(searchThisArea, DRAG_WAIT_MS);
    });

    return () => {
      clearTimeout(dragTimer);
      startListener.remove();
      endListener.remove();
    };
  }, [mapReady, checkIn, checkOut]);

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
  }, [selectedId, shownPlaces]);

  // turn the bubbles you already clicked grey
  useEffect(() => {
    visitedIds.forEach((id) => {
      const bubble = document.getElementById("pin-" + id);
      if (bubble) bubble.classList.add("visited");
    });
  }, [visitedIds, shownPlaces]);

  // runs when either filter box changes
  function changeFilters(newMaxPrice, newMinRating) {
    setMaxPrice(newMaxPrice);
    setMinRating(newMinRating);

    // close the popup if its hotel doesn't match anymore
    const openHotel = places.find((place) => place.id === openId);
    if (openHotel && !passesFilters(openHotel, newMaxPrice, newMinRating)) {
      setOpenId(null);
    }
  }

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

    // start the new city with no filters
    setMaxPrice("");
    setMinRating("0");

    // forget the old drags, drop any that are still loading, and zoom to the new city
    searchIdRef.current += 1;
    lastCenterRef.current = null;
    searchedAreasRef.current = new Set();
    shouldZoomRef.current = true;
    setAreaNote("");

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

    let frame;

    // measure where the card fits, but only once google has put it on the map
    function measureCard() {
      const card = popupDiv.querySelector(".map-popup");

      // not on the map yet (no size), so try again next frame
      if (!card || card.getBoundingClientRect().width === 0) {
        frame = requestAnimationFrame(measureCard);
        return;
      }

      setPopupShift({ id: openPlace.id, ...findPopupShift(openPlace.id, mapDiv.current, popupDiv) });
    }

    frame = requestAnimationFrame(measureCard);

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

          {/* filter boxes */}
          <div className="hotel-filters">
            <label>
              Max price
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={maxPrice}
                onChange={(event) => changeFilters(event.target.value, minRating)}
              />
            </label>

            <label>
              Min rating
              <select
                value={minRating}
                onChange={(event) => changeFilters(maxPrice, event.target.value)}
              >
                <option value="0">Any</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>
          </div>

          <h2>Hotels in {city}</h2>
          <p>{message}</p>

          {/* we have hotels, but the filters hid all of them */}
          {places.length > 0 && shownPlaces.length === 0 && (
            <p>No hotels match your filters</p>
          )}

          {shownPlaces.map((place) => (
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

          {areaNote && <div className="map-note">{areaNote}</div>}

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

                {/* the dates these prices are for, and the total if we have it */}
                <p className="popup-stay">
                  {shortDate(checkIn)} – {shortDate(checkOut)}
                  {openPlace.totalPrice && ` · ${openPlace.totalPrice} total`}
                </p>

                {/* a button, not the whole card, so a stray click doesn't leave the page */}
                <a
                  className="popup-book"
                  href={bookingLink(openPlace)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check availability
                </a>
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
