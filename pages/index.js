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
        try {
          photoUrls = await Promise.all(
            photoFiles.map(async (file) => {
              const url = await uploadPhoto(file);
              return url;
            })
          );
        } catch (error) {
          console.warn("Fallo al subir fotos, continuando sin ellas:", error);
          setErrorMessage("No se pudieron subir las fotos, pero el departamento se guardó.");
          photoUrls = [];
        }
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
      setErrorMessage(error.message || "Error al agregar el departamento");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1>Cargando datos...</h1>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>¡Hola desde Spot.app!</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: "20px" }}
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
        <ul style={{ listStyle: "none", padding: 0 }}>
          {spots.map((spot) => (
            <li
              key={spot.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h2>{spot.description || "Sin descripción"}</h2>
              <p>Precio: {spot.price || "No especificado"}</p>
              <p>Contacto: {spot.contact || "No disponible"}</p>
              {Array.isArray(spot.photos) && spot.photos.length > 0 ? (
                <div>
                  <p>Fotos:</p>
                  {spot.photos.map((photoUrl, index) => (
                    <img
                      key={index}
                      src={photoUrl}
                      alt={`Foto ${index + 1}`}
                      style={{ width: "200px", margin: "5px" }}
                    />
                  ))}
                </div>
              ) : (
                <p>No hay fotos disponibles</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}