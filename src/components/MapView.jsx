import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const MapView = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Crear una referencia a la colección "events"
    const collectionRef = collection(db, "events");

    // Configurar el observador en tiempo real
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const updatedData = [];
      querySnapshot.forEach((doc) => {
        const e = { id: doc.id, ...doc.data() };
        updatedData.push(e);
      });

      setData(updatedData);
    });

    // Al salir del componente, detener la escucha
    return () => unsubscribe();
  }, []);

  return (
    <MapContainer className="render" center={[10.63504, -85.43772]} zoom={9}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data.map((e) => (
        <Marker key={e.id} position={[e.geolocation.lat, e.geolocation.lng]}>
          <Popup>
            <div>
              <h5>{e.name}</h5>
              <img src={e.imgUrls} height={150} width={300} alt="evento.jpg" />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
