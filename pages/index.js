// pages/index.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import SpotForm from "../components/SpotForm";
import SpotList from "../components/SpotList";
import PhotoViewer from "../components/PhotoViewer";

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mainPhoto, setMainPhoto] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        console.log("Intentando obtener spots...");
        const querySnapshot = await getDocs(collection(db, "spots"));
        const spotsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Spots obtenidos:", spotsData);
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

  const handleSpotAdded = async () => {
    const querySnapshot = await getDocs(collection(db, "spots"));
    const updatedSpots = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSpots(updatedSpots);
  };

  const openPhotoViewer = (spot) => {
    setSelectedSpot(spot);
    setMainPhoto(spot.photos[0] || "");
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
      <button className="btn-add" onClick={() => setShowForm(true)}>
        Agregar nuevo departamento
      </button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {showForm && (
        <SpotForm onClose={() => setShowForm(false)} onSpotAdded={handleSpotAdded} />
      )}

      <SpotList spots={spots} onSpotClick={openPhotoViewer} />

      {selectedSpot && (
        <PhotoViewer
          spot={selectedSpot}
          mainPhoto={mainPhoto}
          onClose={closePhotoViewer}
          onChangeMainPhoto={changeMainPhoto}
        />
      )}
    </div>
  );
}