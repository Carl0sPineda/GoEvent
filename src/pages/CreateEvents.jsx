import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "leaflet-fullscreen";

export default function CreateEvents({ isOpen, closeModal }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const [geolocation, setGeolocation] = useState({
    lat: 10.36402678444531,
    lng: -85.3908877959475,
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    category: "",
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
      start_date: "",
      end_date: "",
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
      // const address = data?.display_name ?? "";
      //   setAddress(address);
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

    // Clean up function to remove the map and marker when the component unmounts
    return () => {
      map.remove();
    };
  }, []); // Empty array to run the effect only once

  function onChange(e) {
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    //files
    if (e.target.files) {
      setSelectedImage(e.target.files); //Used for preview the image before upload files[0]

      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    //text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  function uploadMultipleFiles(e) {
    fileObj.push(setSelectedImage(e.target.files[0]));
    for (let i = 0; i < fileObj[0].length; i++) {
      fileArray.push(URL.createObjectURL(fileObj[0][i]));
    }
  }

  // This function will be triggered when the "Remove This Image" button is clicked
  const removeSelectedImage = () => {
    setSelectedImage();
  };

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
    // alert(URL.createObjectURL(selectedImage))//new
    setLoading(true);

    resetForm();

    if (images.length > 6) {
      setLoading(false);
      toast.error("Maximun 6 images are allowed");
      return;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.floor(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            // console.log("Upload is " + progress + "% done");
            setProgress(progress);
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    const docRef = await addDoc(collection(db, "events"), formDataCopy);
    setLoading(false);
    toast.success("Ebvento agregado!");
  }

  return (
    <>
      <div className={`modal ${isOpen ? "show-event" : ""} `}>
        <div
          className="modal-content-event"
          style={{ marginTop: "40px", width: "60%" }}
        >
          <main>
            <h2>Agrega un nuevo evento</h2>
            <br />
            <form onSubmit={onSubmit}>
              {/* 4 column grid layout with text inputs for the first and last names */}
              <div className="row mb-4">
                <div className="col">
                  <div className="form-outline">
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={onChange}
                      required
                      className="form-control"
                    />
                    <label className="form-label" htmlFor="form6Example1">
                      Nombre
                    </label>
                  </div>
                </div>
                <div className="col">
                  <div className="form-outline">
                    <input
                      type="text"
                      id="category"
                      value={category}
                      onChange={onChange}
                      required
                      className="form-control"
                    />
                    <label className="form-label" htmlFor="form6Example2">
                      Categoría
                    </label>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col">
                  <div className="form-outline">
                    <input
                      type="text"
                      id="start_date"
                      value={start_date}
                      onChange={onChange}
                      required
                      className="form-control"
                    />
                    <label className="form-label" htmlFor="form6Example1">
                      Fecha inicio
                    </label>
                  </div>
                </div>
                <div className="col">
                  <div className="form-outline">
                    <input
                      type="text"
                      id="end_date"
                      value={end_date}
                      onChange={onChange}
                      required
                      className="form-control"
                    />
                    <label className="form-label" htmlFor="form6Example2">
                      Fecha fin
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold mb-2">
                  Seleccione una ubicación especifica
                </p>
                <div id="mapid" style={{ height: "400px" }}></div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <p className="text-gray-600">
                  Agrege una imagen la primera será la portada (max 6)
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
                  className="form-group multi-preview md:w-[100%] lg:w-[94%] mt-3  mb-12 md:mb-6"
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

              {loading && (
                <div className="mt-1 mb-1">
                  <span className="font-bold text-cyan-700 text-lg">
                    Subiendo... {progress}%
                  </span>
                  <progress
                    className="bg-gray-300 w-full h-3 rounded-full overflow-hidden"
                    value={progress}
                    max="100"
                  ></progress>
                </div>
              )}

              <button
                type="submit"
                style={{
                  padding: 15,
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
          {/* <button onClick={closeModal} className="close-button">
            <span className="material-symbols-outlined">close</span>
          </button> */}
        </div>
      </div>
    </>
  );
}
