// components/SpotList.js
import Image from "next/image"; // Importar el componente Image de Next.js

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
              <Image
                src={spot.photos[0]} // Primera foto del spot
                alt="Foto principal"
                width={250} // Ancho de la imagen
                height={150} // Alto de la imagen
                objectFit="cover" // Cubrir el espacio recortando si es necesario
              />
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
