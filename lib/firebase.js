// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Configuración de Firebase con variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Depuración: Verifica si las variables están definidas
console.log("Firebase Config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const storage = getStorage(app);

export const addSpot = async (description, price, contact, photos, location, category, type) => {
  try {
    const docRef = await addDoc(collection(db, "spots"), {
      description,
      price,
      contact,
      photos: photos || [], // Asegura que photos sea un array incluso si está vacío
      location, // Campo location con las coordenadas
      category, // Nuevo campo categoría
      type, // Nuevo campo tipo
      timestamp: new Date().toISOString(), // Añadimos timestamp para ordenar
    });
    console.log("Documento agregado con ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error agregando documento: ", e);
    throw e;
  }
};

export const uploadPhoto = async (file) => {
  try {
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);
    const storageRef = ref(storage, `spots-photos/${sanitizedFileName}`);
    console.log("Iniciando subida de:", sanitizedFileName);

    const snapshot = await uploadBytes(storageRef, file);
    console.log("Subida completada, obteniendo URL...");

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("URL obtenida:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error en uploadPhoto:", error);
    throw error;
  }
};

// Exportamos collection y getDocs para usar en SpotForm.js
export { collection, getDocs };