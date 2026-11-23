/**
 * Class name: PlacePhotoAPI
 * Date: 11/23/2026
 * Programmer: Alejandro Rivera
 * Description: Finds a place on Google (Places API) and returns the link
 * to its main photo, the first one Google shows for that place.
 */
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Remember photos we already found so each place is only looked up once
const savedPhotos = {};

/**
 * Searches Google for a place and returns its main photo link.
 *
 * @param {string} searchText - What to search for, like "Kyoto Temple Kyoto, Japan".
 * @returns {Promise<string|null>} The photo link, or null if none was found.
 */
export async function getPlacePhoto(searchText) {
  if (!API_KEY || !searchText) return null;

  if (savedPhotos[searchText] !== undefined) {
    return savedPhotos[searchText];
  }

  // Ask Google for the best matching place, and only its photos
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.photos",
    },
    body: JSON.stringify({ textQuery: searchText, pageSize: 1 }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const photo = data.places?.[0]?.photos?.[0];

  // Turn the photo's name into a link the <img> tag can show
  const photoUrl = photo
    ? `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${API_KEY}`
    : null;

  savedPhotos[searchText] = photoUrl;
  return photoUrl;
}
