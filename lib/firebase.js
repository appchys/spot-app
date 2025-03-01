// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD4jpKxhgZHCSGOzR-WM0FdYzPLe486GB0",
  authDomain: "spotapp-1.firebaseapp.com",
  projectId: "spotapp-1",
  storageBucket: "spotapp-1.appspot.com",
  messagingSenderId: "17276244914",
  appId: "1:17276244914:web:c3a4f16118e9ec9d8e0aab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const storage = getStorage(app);

export const addSpot = async (description, price, contact, photos) => {
  try {
    const docRef = await addDoc(collection(db, "spots"), {
      description,
      price,
      contact,
      photos,
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