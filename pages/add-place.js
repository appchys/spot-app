// pages/add-place.js
import { useState } from "react";
import { addSpot, uploadPhoto } from "../lib/firebase";

export default function AddPlace() {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [photos, setPhotos] = useState([]);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    const photoUrls = [];

    for (let file of files) {
      const url = await uploadPhoto(file);
      photoUrls.push(url);
    }

    setPhotos(photoUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSpot(description, price, contact, photos);
    // Reset form after submission
    setDescription("");
    setPrice("");
    setContact("");
    setPhotos([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Precio"
        required
      />
      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Contacto"
        required
      />
      <input type="file" multiple onChange={handleFileChange} />
      <button type="submit">Agregar Spot</button>
    </form>
  );
}
