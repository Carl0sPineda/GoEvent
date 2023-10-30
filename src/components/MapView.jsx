import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import L from "leaflet";
import green from "../assets/green.svg";
import red from "../assets/red.svg";

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

  const formatDate = (date) => {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const isEventNear = (event) => {
    const now = new Date();
    const timeDifference = event.start_date.toDate() - now;
    const hoursUntilEvent = timeDifference / (1000 * 60 * 60);

    // Define el período de tiempo para considerar un evento como próximo
    const hoursThreshold = 24; // Por ejemplo, 24 horas

    if (hoursUntilEvent < 0) {
      return false; // Eventos anteriores al día actual en rojo
    } else if (hoursUntilEvent <= hoursThreshold) {
      return true; // Eventos próximos en verde
    } else {
      return false; // Eventos superiores a 24 horas en rojo
    }
  };

  return (
    <MapContainer className="render" center={[10.63504, -85.43772]} zoom={9}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data.map((e) => (
        <Marker
          key={e.id}
          position={[e.geolocation.lat, e.geolocation.lng]}
          icon={
            isEventNear(e)
              ? L.icon({
                  iconUrl: green, // Ruta al archivo SVG green
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40],
                })
              : L.icon({
                  iconUrl: red, // Ruta al archivo SVG red
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40],
                })
          }
        >
          <Popup>
            <h5>{e.name}</h5>
            <img src={e.imgUrls} height={150} width={300} alt="evento.jpg" />
            <div style={{ marginTop: "7px" }}>
              <span>Fecha de inicio: {formatDate(e.start_date.toDate())}</span>
              <br />
              <span>Fecha de fin: {formatDate(e.end_date.toDate())}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
