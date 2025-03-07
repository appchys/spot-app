// components/PhotoViewer.js
import Image from "next/image"; // Importar el componente Image de Next.js

export default function PhotoViewer({ spot, mainPhoto, onClose, onChangeMainPhoto }) {
  return (
    <div className="photo-viewer" onClick={onClose}>
      <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
        <div className="main-photo">
          <Image
            src={mainPhoto}
            alt="Foto principal"
            width={400} // Ancho de la imagen
            height={400} // Alto de la imagen
            objectFit="contain" // Ajustar la imagen sin recortar
          />
        </div>
        {Array.isArray(spot.photos) && spot.photos.length > 0 && (
          <div className="thumbnails">
            {spot.photos.slice(0, 3).map((photoUrl, index) => (
              <Image
                key={index}
                src={photoUrl}
                alt={`Miniatura ${index + 1}`}
                width={100} // Ancho de la miniatura
                height={100} // Alto de la miniatura
                objectFit="cover" // Cubrir el espacio recortando si es necesario
                className={`thumbnail ${mainPhoto === photoUrl ? "active" : ""}`}
                onClick={() => onChangeMainPhoto(photoUrl)}
              />
            ))}
          </div>
        )}
        <span className="close-btn" onClick={onClose}>
          ×
        </span>
      </div>
    </div>
  );
}