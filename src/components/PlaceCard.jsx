// one card in the hotel list on the maps page
// called PlaceCard so we can reuse it for restaurants and stuff later
function PlaceCard({ place }) {
  return (
    <div className="place-card">
      {/* only show the pic if the hotel has one */}
      {place.image && <img src={place.image} alt={place.name} />}

      <div>
        <h3>{place.name}</h3>

        {/* rating + number of reviews, skip it if there's no rating */}
        {place.rating && (
          <p>
            <span className="rating">{place.rating}</span> ★ ({place.reviews}{" "}
            reviews)
          </p>
        )}

        {/* some hotels dont have a price so show a message instead */}
        <p className="price">
          {place.price ? `${place.price} / night` : "Price not available"}
        </p>
      </div>
    </div>
  );
}

export default PlaceCard;
