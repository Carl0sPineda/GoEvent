import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
import green from "../assets/green.svg";
import red from "../assets/red.svg";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";

const MapView = () => {
  const auth = getAuth();
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [confirmedEvents, setConfirmedEvents] = useState([]);
  const [attendeeNames, setAttendeeNames] = useState({});
  const [attendeesCount, setAttendeesCount] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
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
    const hoursThreshold = 24;

    if (hoursUntilEvent < 0) {
      return false;
    } else if (hoursUntilEvent <= hoursThreshold) {
      return true;
    } else {
      return false;
    }
  };

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

  return (
    <MapContainer className="render" center={[10.46701, -84.96775]} zoom={9}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data.map((e) => (
        <Marker
          key={e.id}
          position={[e.geolocation.lat, e.geolocation.lng]}
          icon={
            isEventNear(e)
              ? L.icon({
                  iconUrl: green,
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40],
                })
              : L.icon({
                  iconUrl: red,
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
                Asistentes 0
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
