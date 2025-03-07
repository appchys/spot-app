// components/SpotList.js
export default function SpotList({ spots, onSpotClick }) {
    return (
      <div className="spots-list">
        {spots.length === 0 ? (
          <p>No hay lugares disponibles aún.</p>
        ) : (
          spots.map((spot) => (
            <div
              key={spot.id}
              className="spot-card"
              onClick={() => onSpotClick(spot)}
            >
              {Array.isArray(spot.photos) && spot.photos.length > 0 ? (
                <img src={spot.photos[0]} alt="Foto principal" />
              ) : (
                <p>No hay fotos</p>
              )}
              <h2>{spot.description || "Sin descripción"}</h2>
              <p>Precio: {spot.price || "No especificado"}</p>
            </div>
          ))
        )}
      </div>
    );
  }