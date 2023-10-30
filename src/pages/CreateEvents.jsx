import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import L from "leaflet";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "leaflet-fullscreen";

export default function CreateEvents({ isOpen, closeModal }) {
  const auth = getAuth();
  const [geolocation, setGeolocation] = useState({
    lat: 10.36402678444531,
    lng: -85.3908877959475,
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    start_date: new Date(),
    end_date: new Date(),
    category: "", // Campo para la categoría
    latitude: 0,
    longitude: 0,
    images: {},
  });

  const { name, start_date, end_date, category, latitude, longitude, images } =
    formData;

  const icon = L.icon({
    iconUrl: "https://www.svgrepo.com/show/475417/location.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // Restablecer el formulario después de enviar los datos
  const resetForm = () => {
    setFormData({
      name: "",
      start_date: new Date(),
      end_date: new Date(),
      category: "",
      latitude: 0,
      longitude: 0,
      images: {},
    });
    setSelectedImage([]);
    setProgress(0);
  };

  useEffect(() => {
    const map = L.map("mapid").setView([geolocation.lat, geolocation.lng], 10);

    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "OpenStreetMap contributors",
      }
    );

    const esriLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Esri",
      }
    );

    osmLayer.addTo(map);

    const baseLayers = {
      "Por defecto": osmLayer,
      Satelite: esriLayer,
    };

    const marker = L.marker([geolocation.lat, geolocation.lng], {
      draggable: true,
      icon: icon,
    }).addTo(map);

    marker.on("dragend", async function (e) {
      const { lat, lng } = e.target.getLatLng();
      setGeolocation({ lat, lng });

      setFormData((prevState) => ({
        ...prevState,
        latitude: lat,
        longitude: lng,
      }));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();
    });

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const { center } = e.geocode;
        marker.setLatLng(center);
        map.setView(center, 16);
      })
      .addTo(map);

    L.control
      .scale({
        position: "bottomright",
      })
      .addTo(map);

    L.control
      .fullscreen({
        position: "topleft",
      })
      .addTo(map);

    L.control.layers(baseLayers).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  function onChange(e) {
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }

    if (e.target.files) {
      setSelectedImage(e.target.files);

      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && event.target.classList.contains("modal")) {
        closeModal();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen, closeModal]);

  async function onSubmit(e) {
    e.preventDefault();

    setLoading(true);

    resetForm();

    if (images.length > 6) {
      setLoading(false);
      toast.error("Máximo 6 imágenes permitidas");
      return;
    }

    // Guardar las imágenes en Firebase Storage
    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // Generar un nombre único para cada imagen
      const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

      try {
        // Subir la imagen a Firebase Storage
        const storageRef = ref(getStorage(), filename);
        await uploadBytesResumable(storageRef, image);

        // Obtener la URL de descarga de la imagen
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
      }
    }

    // Convertir startDate y endDate a objetos de fecha
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const eventDoc = {
      name,
      start_date: startDateObj, // Almacenar como objeto de fecha
      end_date: endDateObj, // Almacenar como objeto de fecha
      category,
      latitude,
      longitude,
      imgUrls: imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };

    // Guardar los datos en Firestore
    try {
      const docRef = await addDoc(collection(db, "events"), eventDoc);
      toast.success("Evento agregado!");
    } catch (error) {
      console.error("Error al guardar el evento en Firestore:", error);
      toast.error("Error al guardar el evento");
    }
  }

  return (
    <div className={`modal ${isOpen ? "show-event" : ""} `}>
      <div
        className="modal-content-event"
        style={{ marginTop: "40px", width: "60%" }}
      >
        <main>
          <div className="d-flex ">
            <span className="material-symbols-outlined">calendar_month</span>
            <span
              className="d-none d-sm-flex d-md-flex ps-2"
              style={{ fontWeight: "bold" }}
            >
              Agregar un nuevo evento
            </span>
          </div>
          <br />
          <form onSubmit={onSubmit}>
            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <input
                    placeholder="Ingrese un nombre al evento"
                    type="text"
                    id="name"
                    value={name}
                    onChange={onChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <select
                    id="category"
                    value={category}
                    onChange={onChange}
                    required
                    className="form-control"
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="Lectura">Lectura</option>
                    <option value="Fiestas">Fiestas</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Charla">Charla</option>
                    <option value="Comidas">Comidas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row" style={{ marginBottom: 20 }}>
              <div className="col">
                <div className="form-outline">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="yyyy/MM/dd HH:mm"
                    className="form-control"
                    style={{ zIndex: 1 }}
                  />
                  <label className="form-label" style={{ marginLeft: 10 }}>
                    Fecha de inicio
                  </label>
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="yyyy/MM/dd HH:mm"
                    className="form-control"
                    style={{ zIndex: 1 }}
                  />
                  <label className="form-label" style={{ marginLeft: 10 }}>
                    Fecha de fin
                  </label>
                </div>
              </div>
            </div>

            <div>
              <p className="text-lg font-semibold mb-2">
                Selecciona una ubicación específica
              </p>
              <div id="mapid" style={{ height: "400px", zIndex: 0 }}></div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <p className="text-gray-600">
                Agrega una imagen, la primera será la portada (máx. 6)
              </p>
              <input
                type="file"
                id="images"
                onChange={onChange}
                accept=".jpg,.png,.jpeg"
                multiple
                required
              />
              <div
                className="form-group multi-preview md:w-[100%] lg:w-[94%] mt-3 mb-12 md:mb-6"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <ul className="has-scrollbar">
                  {selectedImage &&
                    Array.from(selectedImage).map((image, index) => (
                      <img
                        className="rounded-2xl"
                        key={index}
                        src={URL.createObjectURL(image)}
                        alt={`Image ${index}`}
                        style={{
                          maxWidth: "100%",
                          height: "220px",
                          marginRight: "10px",
                        }}
                      />
                    ))}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: 8,
                marginBottom: "40px",
                width: "300px",
                background: "black",
                color: "white",
              }}
            >
              Guardar
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
