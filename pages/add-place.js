// pages/index.js (o puedes renombrarlo como desees)
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; // Importa la referencia de Firestore
import { useRouter } from "next/router";

export default function Home() {
  const [spots, setSpots] = useState([]); // Estado para almacenar los departamentos
  const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario
  const router = useRouter();

  // Obtener los departamentos desde Firestore cuando el componente se monta
  useEffect(() => {
    const getSpots = async () => {
      const querySnapshot = await getDocs(collection(db, "spots"));
      const spotsArray = [];
      querySnapshot.forEach((doc) => {
        spotsArray.push({ ...doc.data(), id: doc.id });
      });
      setSpots(spotsArray); // Guardar los departamentos en el estado
    };

    getSpots();
  }, []);

  // Función para mostrar el formulario cuando se hace clic en "Añadir un Lugar"
  const handleAddPlace = () => {
    setShowForm(true);
  };

  return (
    <div className="container">
      <h1>Bienvenido a Spot.app</h1>

      {/* Botón para agregar un departamento */}
      <button onClick={handleAddPlace} className="btn-add">
        Añadir un Lugar
      </button>

      {/* Mostrar formulario cuando showForm es true */}
      {showForm && (
        <form className="form-add-place">
          <h2>Agregar un Nuevo Lugar</h2>
          {/* Aquí irá el formulario para agregar un departamento */}
        </form>
      )}

      {/* Mostrar los departamentos en una lista */}
      <div className="spots-list">
        <h2>Departamentos Disponibles</h2>
        <ul>
          {spots.length > 0 ? (
            spots.map((spot) => (
              <li key={spot.id} className="spot-card">
                <h3>{spot.description}</h3>
                <p>Precio: {spot.price}</p>
                <p>Contacto: {spot.contact}</p>
                <div className="spot-photos">
                  {spot.photos && spot.photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`foto-${index}`} className="spot-photo" />
                  ))}
                </div>
              </li>
            ))
          ) : (
            <p>No hay departamentos disponibles en este momento.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
