// components/SpotForm.js
import React, { useState, useEffect, useCallback } from "react";
import { addSpot, uploadPhoto, db } from "../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "250px",
  height: "150px",
  marginBottom: "15px",
};

const libraries = ["places"];

export default function SpotForm({ onClose, onSpotAdded }) {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    contact: "",
    category: "",
    type: "",
    location: { lat: null, lng: null },
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [categories, setCategories] = useState(["Departamentos", "Casas", "Restaurantes", "Locales"]);
  const [types, setTypes] = useState(["Alquiler", "Venta", "Spot"]);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDWL-OI7UYilLvg2b96pL6yfDk-AWrevIM", // Tu API Key
    libraries,
  });

  // Cargar categorías y tipos desde Firebase al montar el componente
  useEffect(() => {
    setIsClient(true);

    const fetchCategoriesAndTypes = async () => {
      try {
        // Cargar categorías
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => doc.data().name);
        setCategories((prev) => [...prev, ...fetchedCategories.filter((cat) => !prev.includes(cat))]);

        // Cargar tipos
        const typesSnapshot = await getDocs(collection(db, "types"));
        const fetchedTypes = typesSnapshot.docs.map((doc) => doc.data().name);
        setTypes((prev) => [...prev, ...fetchedTypes.filter((type) => !prev.includes(type))]);
      } catch (error) {
        console.error("Error al cargar categorías o tipos:", error);
      }
    };

    fetchCategoriesAndTypes();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setPhotoFiles((prevFiles) => [...prevFiles, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  }, []);

  const getLocation = useCallback(() => {
    if (isClient && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
        },
        (error) => {
          console.error("Error al obtener ubicación:", error);
          setErrorMessage("No se pudo obtener la ubicación");
        }
      );
    } else if (!isClient) {
      console.log("Geolocalización no disponible durante SSR");
    } else {
      setErrorMessage("La geolocalización no es soportada por este navegador");
    }
  }, [isClient]);

  const addNewCategory = useCallback(async () => {
    if (newCategory && !categories.includes(newCategory)) {
      try {
        await addDoc(collection(db, "categories"), { name: newCategory });
        setCategories((prev) => [...prev, newCategory]);
        setFormData((prev) => ({ ...prev, category: newCategory }));
        setNewCategory("");
      } catch (error) {
        console.error("Error al agregar categoría:", error);
        setErrorMessage("No se pudo agregar la categoría");
      }
    }
  }, [newCategory, categories]);

  const addNewType = useCallback(async () => {
    if (newType && !types.includes(newType)) {
      try {
        await addDoc(collection(db, "types"), { name: newType });
        setTypes((prev) => [...prev, newType]);
        setFormData((prev) => ({ ...prev, type: newType }));
        setNewType("");
      } catch (error) {
        console.error("Error al agregar tipo:", error);
        setErrorMessage("No se pudo agregar el tipo");
      }
    }
  }, [newType, types]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setIsUploading(true);
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
          photoUrls,
          formData.location,
          formData.category, // Añadimos categoría
          formData.type // Añadimos tipo
        );

        setFormData({
          description: "",
          price: "",
          contact: "",
          category: "",
          type: "",
          location: { lat: null, lng: null },
          photos: [],
        });
        setPhotoFiles([]);
        setPhotoPreviews([]);
        onSpotAdded();
        onClose();
      } catch (error) {
        console.error("Error al agregar el departamento:", error);
        setErrorMessage("Error al agregar el departamento: " + error.message);
      } finally {
        setLoading(false);
        setIsUploading(false);
      }
    },
    [formData, photoFiles, onSpotAdded, onClose]
  );

  if (loadError) return <div>Error al cargar el mapa</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <label>Descripción:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <label>Precio:</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
          <label>Contacto:</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            required
          />
          <label>Categoría:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            style={{ marginBottom: "10px" }}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Nueva categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="button" onClick={addNewCategory}>
              Agregar
            </button>
          </div>

          <label>Tipo:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            style={{ marginBottom: "10px" }}
          >
            <option value="">Selecciona un tipo</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Nuevo tipo"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />
            <button type="button" onClick={addNewType}>
              Agregar
            </button>
          </div>

          <label>Ubicación:</label>
          <button
            type="button"
            onClick={getLocation}
            style={{ marginBottom: "10px" }}
          >
            Obtener mi ubicación
          </button>
          {isClient && formData.location.lat && formData.location.lng && (
            <div style={mapContainerStyle}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={13}
                center={{ lat: formData.location.lat, lng: formData.location.lng }}
              >
                <Marker position={{ lat: formData.location.lat, lng: formData.location.lng }} />
              </GoogleMap>
            </div>
          )}
          <label>Fotos (opcional):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
            {photoPreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Miniatura ${index + 1}`}
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
            ))}
          </div>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar departamento"}
          </button>
        </form>
      </div>
      {isUploading && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
          <span role="img" aria-label="Cargando">
            ⏳
          </span>
        </div>
      )}
    </div>
  );
}