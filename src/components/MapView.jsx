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
      console.log(updatedData);
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
              <h5
                style={{
                  position: "absolute",
                  bottom: "0",
                  backgroundColor: "white", // Fondo blanco para que sea legible
                  padding: "5px",
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)", // Sombra para resaltar el texto
                  zIndex: 1, // Asegura que el texto esté sobre la imagen
                }}
              >
                {e.name}
              </h5>
              <img src={e.imgUrls} height={150} width={300} alt="evento.jpg" />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
