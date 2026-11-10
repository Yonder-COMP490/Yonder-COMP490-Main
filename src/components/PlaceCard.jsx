// one card in the hotel list on the maps page
// called PlaceCard so we can reuse it for restaurants and stuff later
// selected = highlight this card, onHover / onClick = what to do on hover / click
function PlaceCard({ place, selected, onHover, onClick }) {
  return (
    <div
      id={"card-" + place.id} // so the map can scroll to this card
      className={selected ? "place-card selected" : "place-card"}
      onMouseEnter={onHover}
      onClick={onClick}
    >
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
