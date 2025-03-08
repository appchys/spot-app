// components/SpotForm.js
import React, { useState, useEffect, useCallback } from "react";
import { addSpot, uploadPhoto, db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import Select from "react-select"; // Importamos react-select

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
    categories: [], // Ahora es un array para selección múltiple
    types: [], // Ahora es un array para selección múltiple
    location: { lat: null, lng: null },
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "Departamentos", label: "Departamentos" },
    { value: "Casas", label: "Casas" },
    { value: "Restaurantes", label: "Restaurantes" },
    { value: "Locales", label: "Locales" },
  ]);
  const [typeOptions, setTypeOptions] = useState([
    { value: "Alquiler", label: "Alquiler" },
    { value: "Venta", label: "Venta" },
    { value: "Spot", label: "Spot" },
  ]);
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
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          value: doc.data().name,
          label: doc.data().name,
        }));
        setCategoryOptions((prev) => [
          ...prev,
          ...fetchedCategories.filter((cat) => !prev.some((p) => p.value === cat.value)),
        ]);

        // Cargar tipos
        const typesSnapshot = await getDocs(collection(db, "types"));
        const fetchedTypes = typesSnapshot.docs.map((doc) => ({
          value: doc.data().name,
          label: doc.data().name,
        }));
        setTypeOptions((prev) => [
          ...prev,
          ...fetchedTypes.filter((type) => !prev.some((p) => p.value === type.value)),
        ]);
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

  const handleCategoryChange = useCallback(
    (selectedOptions) => {
      const selectedCategories = selectedOptions ? selectedOptions.map((option) => option.value) : [];
      setFormData((prev) => ({ ...prev, categories: selectedCategories }));
    },
    []
  );

  const handleTypeChange = useCallback(
    (selectedOptions) => {
      const selectedTypes = selectedOptions ? selectedOptions.map((option) => option.value) : [];
      setFormData((prev) => ({ ...prev, types: selectedTypes }));
    },
    []
  );

  const handleCategoryCreate = useCallback(
    async (inputValue) => {
      const newCategory = { value: inputValue, label: inputValue };
      try {
        await addDoc(collection(db, "categories"), { name: inputValue });
        setCategoryOptions((prev) => [...prev, newCategory]);
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, inputValue],
        }));
      } catch (error) {
        console.error("Error al agregar categoría:", error);
        setErrorMessage("No se pudo agregar la categoría");
      }
    },
    []
  );

  const handleTypeCreate = useCallback(
    async (inputValue) => {
      const newType = { value: inputValue, label: inputValue };
      try {
        await addDoc(collection(db, "types"), { name: inputValue });
        setTypeOptions((prev) => [...prev, newType]);
        setFormData((prev) => ({
          ...prev,
          types: [...prev.types, inputValue],
        }));
      } catch (error) {
        console.error("Error al agregar tipo:", error);
        setErrorMessage("No se pudo agregar el tipo");
      }
    },
    []
  );

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
          formData.categories, // Array de categorías
          formData.types // Array de tipos
        );

        setFormData({
          description: "",
          price: "",
          contact: "",
          categories: [],
          types: [],
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
          <label>Categorías:</label>
          <Select
            isMulti
            name="categories"
            options={categoryOptions}
            value={categoryOptions.filter((option) => formData.categories.includes(option.value))}
            onChange={handleCategoryChange}
            onCreateOption={handleCategoryCreate}
            placeholder="Escribe o selecciona categorías..."
            isClearable
            styles={{ container: (base) => ({ ...base, marginBottom: "15px" }) }}
          />

          <label>Tipo:</label>
          <Select
            isMulti
            name="types"
            options={typeOptions}
            value={typeOptions.filter((option) => formData.types.includes(option.value))}
            onChange={handleTypeChange}
            onCreateOption={handleTypeCreate}
            placeholder="Escribe o selecciona tipos..."
            isClearable
            styles={{ container: (base) => ({ ...base, marginBottom: "15px" }) }}
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