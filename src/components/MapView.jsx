import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import L from "leaflet";
import green_dep from "../assets/green_dep.svg";
import red_com from "../assets/red_com.svg";
import blue_lec from "../assets/blue_lec.svg";
import yellow_par from "../assets/yellow_par.svg";
import black_char from "../assets/black_char.svg";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

const MapView = ({ selectedFilters,searchTerm }) => {
  const auth = getAuth();
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [confirmedEvents, setConfirmedEvents] = useState([]);
  const [attendeeNames, setAttendeeNames] = useState({});
  const [attendeesCount, setAttendeesCount] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);




  useEffect(() => {    
   
    // console.log(auth.currentUser)
    const collectionRef = collection(db, "events");
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const updatedData = [];
      querySnapshot.forEach((doc) => {
        const e = { id: doc.id, ...doc.data() };
        updatedData.push(e);
      });
      setData(updatedData);
      
    });

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    const confirmedEventsRef = collection(db, "assistance");
    const q = query(confirmedEventsRef, where("userId", "==", userId));

    const confirmedEventsUnsubscribe = onSnapshot(q, (querySnapshot) => {
      const confirmedEventIds = querySnapshot.docs.map(
        (doc) => doc.data().eventId
      );
      setConfirmedEvents(confirmedEventIds);

      const updateAttendeeData = async () => {
        const names = {};
        const counts = {};

        for (const eventId of confirmedEventIds) {
          const attendeeData = await getAttendeeData(eventId);
          names[eventId] = attendeeData.names;
          counts[eventId] = attendeeData.count;
        }

        setAttendeeNames(names);
        setAttendeesCount(counts);
      };

      updateAttendeeData();
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
      confirmedEventsUnsubscribe();
    };
  }, [userId]);

  const GeocoderControl = ({ map }) => {
    useEffect(() => {
      if (!map) return;

      const geocoder = L.Control.Geocoder.nominatim();
      const control = L.Control.geocoder({
        geocoder: geocoder,
      });

      control.addTo(map);

      map.on("geocode:result", (event) => {
        const { center, bounds } = event.geocode || {};

        if (center) {
          map.setView(center, 16); // Set the map view to the location with zoom level 10
        } else if (bounds) {
          map.fitBounds(bounds);
        }
      });

      return () => {
        map.removeControl(control);
      };
    }, [map]);

    return null;
  };

  const CustomGeocoderControl = () => {
    const map = useMap();
    return <GeocoderControl map={map} />;
  };

  const CustomZoomControl = () => {
    const map = useMap();

    useEffect(() => {
      const zoomControl = L.control.zoom({ position: "topright" });
      zoomControl.addTo(map);

      return () => {
        map.removeControl(zoomControl);
      };
    }, [map]);

    return null;
  };

  const formatDate = (date) => {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // const isEventNear = (event) => {
  //   const now = new Date();
  //   const timeDifference = event.start_date.toDate() - now;
  //   const hoursUntilEvent = timeDifference / (1000 * 60 * 60);
  //   const hoursThreshold = 24;

  //   if (hoursUntilEvent < 0) {
  //     return false;
  //   } else if (hoursUntilEvent <= hoursThreshold) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  const getAttendeeData = async (eventId) => {
    try {
      const confirmedEventsRef = collection(db, "assistance");
      const q = query(confirmedEventsRef, where("eventId", "==", eventId));

      const attendeeData = { names: [], count: 0 };
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const userName = doc.data().userName;
        attendeeData.names.push(userName);
        attendeeData.count++;
      });

      return attendeeData;
    } catch (error) {
      console.error("Error al obtener los datos de los asistentes:", error);
      return { names: [], count: 0 };
    }
  };

  const confirmAttendance = async (eventId) => {
    try {
      if (userId) {
        if (confirmedEvents.includes(eventId)) {
          toast.error("Ya has confirmado la asistencia a este evento");
        } else {
          const user = auth.currentUser;
          const userName = user.displayName;

          if (!userName) {
            Swal.fire(
              "Nombre de usuario no encontrado",
              "Debes configurar un nombre de usuario en tu perfil para confirmar asistencia.",
              "error"
            );
            return;
          }

          const result = await Swal.fire({
            title: "¿Confirmar asistencia?",
            text: "¿Estás seguro de que deseas confirmar tu asistencia a este evento?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
          });

          if (result.isConfirmed) {
            const attendanceRef = collection(db, "assistance");
            const attendanceData = {
              eventId,
              userId,
              userName,
              timestamp: serverTimestamp(),
            };
            await addDoc(attendanceRef, attendanceData);
            toast.success("Asistencia confirmada exitosamente.");
          }
        }
      } else {
        Swal.fire(
          "Usuario no autenticado",
          "Debes iniciar sesión para confirmar asistencia",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al confirmar la asistencia: ", error);
      Swal.fire("Error", "Hubo un error al confirmar la asistencia", "error");
    }
  };

  const legendStyle = {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5px",
    zIndex: 1000,
    width: 100,
    boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.2)",
  };

  // const filteredEvents =
  //   selectedFilters.length > 0
  //     ? data.filter((e) => selectedFilters.includes(e.category))
  //     : data;

  const filterByCategoryAndSearch = () => {
    // Filtrar por categoría
    const filteredByCategory = selectedFilters.length > 0
      ? data.filter(e => selectedFilters.includes(e.category))
      : data;
  
    // Filtrar por término de búsqueda
    const filteredBySearch = searchTerm
      ? filteredByCategory.filter((e) =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredByCategory;
  
    return filteredBySearch;
  };
  
  const filteredEvents = filterByCategoryAndSearch();

  return (
    <MapContainer className="render" center={[10.46701, -84.96775]} zoom={9}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CustomGeocoderControl />
      <CustomZoomControl />

      <div style={legendStyle}>
        <div style={{ marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "blue",
                marginRight: "5px",
                zIndex: 1000,
              }}
            ></div>
            <span style={{ zIndex: 1000 }}>Lectura </span>
          </div>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "green",
                marginRight: "5px",
                zIndex: 1000,
              }}
            ></div>
            <span style={{ zIndex: 1000 }}>Deportes </span>
          </div>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "yellow",
                marginRight: "5px",
                zIndex: 1000,
              }}
            ></div>
            <span style={{ zIndex: 1000 }}>Fiestas</span>
          </div>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "red",
                marginRight: "5px",
                zIndex: 1000,
              }}
            ></div>
            <span style={{ zIndex: 1000 }}>Comidas</span>
          </div>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "black",
                marginRight: "5px",
                zIndex: 1000,
              }}
            ></div>
            <span style={{ zIndex: 1000 }}>Charla</span>
          </div>
        </div>
      </div>

      {filteredEvents.map((e) => (
        <Marker
          key={e.id}
          position={[e.geolocation.lat, e.geolocation.lng]}
          icon={L.icon({
            iconUrl:
              e.category === "Lectura"
                ? blue_lec
                : e.category === "Deportes"
                ? green_dep
                : e.category === "Fiestas"
                ? yellow_par
                : e.category === "Comidas"
                ? red_com
                : e.category === "Charla"
                ? black_char
                : null, // Add more categories as needed
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
          })}
        >
          <Popup>
            <h5>{e.name}</h5>
            <img src={e.imgUrls} height={150} width={300} alt="evento.jpg" />
            <div style={{ marginTop: "7px" }}>
              <span>Fecha de inicio: {formatDate(e.start_date.toDate())}</span>
              <br />
              <span>Fecha de fin: {formatDate(e.end_date.toDate())}</span>
              <br />
            </div>
            {userId ? (
              confirmedEvents.includes(e.id) ? (
                <div className="d-flex" style={{ marginTop: 5 }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "green" }}
                  >
                    add_task
                  </span>
                  <span
                    className="d-none d-sm-flex d-md-flex ps-2"
                    style={{ marginTop: 5 }}
                  >
                    Asistencia confirmada
                  </span>
                  <button
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      left: "305px",
                    }}
                    onClick={() => {
                      setIsOpen(true);
                      setSelectedEvent(e);
                    }}
                  >
                    fact_check
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => confirmAttendance(e.id)}
                    style={{
                      marginTop: "5px",
                      background: "black",
                      color: "white",
                    }}
                  >
                    Confirmar Asistencia
                  </button>
                </div>
              )
            ) : (
              <p>Debes iniciar sesión para confirmar asistencia</p>
            )}
            {attendeesCount[e.id] ? (
              <p style={{ position: "absolute", top: 0, right: 40 }}>
                Asistentes {attendeesCount[e.id]}
              </p>
            ) : (
              <p style={{ position: "absolute", top: 0, right: 40 }}>
                {/* Asistentes 0 */}
              </p>
            )}
            <Modal
              show={isOpen}
              onHide={() => setIsOpen(false)}
              style={{
                background: "rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(5px)",
              }}
            >
              <Modal.Header style={{ background: "black", color: "white" }}>
                <Modal.Title>Asistentes de {selectedEvent?.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ul>
                  {attendeeNames[selectedEvent?.id]?.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setIsOpen(false)}>
                  Cerrar
                </Button>
              </Modal.Footer>
            </Modal>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
