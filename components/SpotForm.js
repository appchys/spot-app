// components/SpotForm.js
import React, { useState, useEffect, useCallback } from "react";
import { addSpot, uploadPhoto } from "../lib/firebase";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "250px",
  height: "150px",
  marginBottom: "15px",
};

const libraries = ["places"]; // Necesario para Google Maps

export default function SpotForm({ onClose, onSpotAdded }) {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    contact: "",
    location: { lat: null, lng: null },
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]); // Almacena todos los archivos seleccionados
  const [photoPreviews, setPhotoPreviews] = useState([]); // Almacena las URLs de las miniaturas
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDWL-OI7UYilLvg2b96pL6yfDk-AWrevIM", // Tu API Key
    libraries, // Añadimos libraries para compatibilidad
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const files = Array.from(e.target.files); // Nuevos archivos seleccionados
    if (files.length > 0) {
      // Agregar los nuevos archivos a los existentes
      setPhotoFiles((prevFiles) => [...prevFiles, ...files]);

      // Generar URLs de miniaturas para los nuevos archivos y añadirlas
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
          formData.location
        );

        // Limpiar el formulario después de guardar
        setFormData({ description: "", price: "", contact: "", location: { lat: null, lng: null }, photos: [] });
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