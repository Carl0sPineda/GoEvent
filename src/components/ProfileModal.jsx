import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const ProfileModal = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  const auth = getAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    interests: [],
  });
  const { name, email, phone, location, interests, imgUrls } = formData;

  function onLogout() {
    auth.signOut();
    navigate("/");
    toast.error("Sesion Cerrada");
  }

  useEffect(() => {
    async function fetchUserData() {
      try {
        const docRef = doc(db, "users", auth?.currentUser?.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();

          // setFormData(userData);
          setFormData({
            ...formData, // Mantén los valores actuales
            ...userData, // Actualiza con los datos del usuario
          });
        } else {
          console.log("User data not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  return (
    <div
      className="modal modal-sm"
      tabIndex="-1"
      role="dialog"
      style={{ display: "block" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content modal-with-background">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              onClick={onClose}
              style={{ fontSize: "10px" }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body text-center text-white">
            {/* Contenido del modal */}

            <img className="imgP" src={imgUrls} alt="" />

            <div className="mt-3">
              <p style={{ fontWeight: "bold" }}>{name}</p>
            </div>
            <div className="mt-3">
              <p>{email}</p>
            </div>
            <div className="mt-3">
              <p>{phone}</p>
            </div>
            <div className="mt-3">
              <p>{location}</p>
            </div>
            <div className="mt-4">
              <p style={{ fontWeight: "bold" }}>Intereses</p>
              {interests.map((interest, index) => (
                <span className="d-block" key={index}>
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="ct-btn-primary"
              onClick={() => navigate("/Profile")}
            >
              Editar
            </button>
            {/* <button type="button" className="ct-btn-primary" onClick={onClose}>Cerrar</button> */}
            <button type="button" className="ct-btn-primary" onClick={onLogout}>
              Cerrar Sesion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
