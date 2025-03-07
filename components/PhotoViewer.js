// components/PhotoViewer.js
export default function PhotoViewer({ spot, mainPhoto, onClose, onChangeMainPhoto }) {
    return (
      <div className="photo-viewer" onClick={onClose}>
        <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
          <div className="main-photo">
            <img src={mainPhoto} alt="Foto principal" />
          </div>
          {Array.isArray(spot.photos) && spot.photos.length > 0 && (
            <div className="thumbnails">
              {spot.photos.slice(0, 3).map((photoUrl, index) => (
                <img
                  key={index}
                  src={photoUrl}
                  alt={`Miniatura ${index + 1}`}
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