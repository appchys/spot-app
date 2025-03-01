// pages/index.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { addSpot, uploadPhoto } from "../lib/firebase";

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    contact: "",
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSpot, setSelectedSpot] = useState(null); // Estado para el visor
  const [mainPhoto, setMainPhoto] = useState(""); // Foto principal del visor

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "spots"));
        const spotsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSpots(spotsData);
      } catch (error) {
        console.error("Error al obtener los spots:", error);
        setErrorMessage("Error al cargar los departamentos");
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setPhotoFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      let photoUrls = [];
      if (photoFiles.length > 0) {
        photoUrls = await Promise.all(
          photoFiles.map(async (file) => {
            const url = await uploadPhoto(file);
            return url;
          })
        );
      }

      await addSpot(
        formData.description,
        formData.price,
        formData.contact,
        photoUrls
      );

      const querySnapshot = await getDocs(collection(db, "spots"));
      const updatedSpots = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSpots(updatedSpots);

      setFormData({ description: "", price: "", contact: "", photos: [] });
      setPhotoFiles([]);
      setShowForm(false);
    } catch (error) {
      console.error("Error al agregar el departamento:", error);
      setErrorMessage("Error al agregar el departamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPhotoViewer = (spot) => {
    setSelectedSpot(spot);
    setMainPhoto(spot.photos[0] || ""); // Establece la primera foto como principal
  };

  const closePhotoViewer = () => {
    setSelectedSpot(null);
    setMainPhoto("");
  };

  const changeMainPhoto = (photoUrl) => {
    setMainPhoto(photoUrl);
  };

  if (loading) {
    return <h1>Cargando datos...</h1>;
  }

  return (
    <div className="container">
      <h1>¡Hola desde Spot.app!</h1>
      <button
        className="btn-add"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancelar" : "Agregar nuevo departamento"}
      </button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <div>
            <label>Descripción:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </div>
          <div>
            <label>Precio:</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </div>
          <div>
            <label>Contacto:</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </div>
          <div>
            <label>Fotos (opcional):</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ marginBottom: "10px" }}
            />
          </div>
          <button type="submit">Guardar departamento</button>
        </form>
      )}

      {spots.length === 0 ? (
        <p>No hay lugares disponibles aún.</p>
      ) : (
        <div className="spots-list">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="spot-card"
              onClick={() => openPhotoViewer(spot)}
            >
              {Array.isArray(spot.photos) && spot.photos.length > 0 ? (
                <img src={spot.photos[0]} alt="Foto principal" />
              ) : (
                <p>No hay fotos</p>
              )}
              <h2>{spot.description || "Sin descripción"}</h2>
              <p>Precio: {spot.price || "No especificado"}</p>
            </div>
          ))}
        </div>
      )}

      {selectedSpot && (
        <div className="photo-viewer" onClick={closePhotoViewer}>
          <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="main-photo">
              <img src={mainPhoto} alt="Foto principal" />
            </div>
            {Array.isArray(selectedSpot.photos) && selectedSpot.photos.length > 0 && (
              <div className="thumbnails">
                {selectedSpot.photos.slice(0, 3).map((photoUrl, index) => (
                  <img
                    key={index}
                    src={photoUrl}
                    alt={`Miniatura ${index + 1}`}
                    className={`thumbnail ${mainPhoto === photoUrl ? "active" : ""}`}
                    onClick={() => changeMainPhoto(photoUrl)}
                  />
                ))}
              </div>
            )}
            <span className="close-btn" onClick={closePhotoViewer}>
              ×
            </span>
          </div>
        </div>
      )}
    </div>
  );
}