import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SingUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: {},
    location: "",
    password: "",
  });
  const [interests, setInterests] = useState([]);
  const { name, email, phone, photo, location, password } = formData;
  const navigate = useNavigate();

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
      setFormData((prevState) => ({
        ...prevState,
        photo: e.target.files, //images
      }));
    }
    //text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }

    console.log(formData);
  }

  const handleSelectChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setInterests((prevInterests) => [...prevInterests, ...selectedOptions]);

    console.log(interests);
  };

  async function onSubmit(e) {
    e.preventDefault();

    async function storeFile(file) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${file.name}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.floor(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }

    try {
      const imgUrls = await Promise.all(
        [...photo].map((image) => storeFile(image))
      ).catch((error) => {
        setLoading(false);
        toast.error("Images not uploaded");
        return;
      });
      const auth = getAuth();
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      updateProfile(auth.currentUser, {
        displayName: name,
      });

      const user = userCredentials.user;

      const formDataCopy = { ...formData, imgUrls, interests };
      delete formDataCopy.photo;
      delete formDataCopy.password;

      await setDoc(doc(db, "users", user.uid), formDataCopy);
      toast.success("Registro éxitoso!!!");
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Ese email ya esta en uso");
      } else if (error.code === "auth/weak-password") {
        toast.error("La contraseña debe tener minimo 6 caracteres");
      } else {
        toast.error("Algo fallo en el registro");
      }
      console.log(error);
    }
  }

  return (
    <section>
      <div className="container-fluid vh-100 bg-white d-flex justify-content-center align-items-center">
        <div className="container-principal row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2">
          <div className="col container-formulario">
            {/* <!-- TITULO Y LOGO --> */}
            <div className="row justify-content-center align-items-lg-center p-2">
              {/* <h4 className="text-align-center mt-2">Crea tu cuenta</h4> */}
            </div>
            {/* <!-- FORMULARIO --> */}
            <div className="row p-2">
              <div>
                <div className="text-center">
                  <labael>Registrarse</labael>
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-2">
                <div className="mb-3">
                  {/* <label htmlFor="email" className="">Nombre Completo</label> */}
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="Nombre Completo"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="number"
                    id="phone"
                    value={phone}
                    onChange={onChange}
                    required
                    placeholder="Telefono"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={onChange}
                    required
                    placeholder="Ubicación"
                    className="form-control"
                  />
                </div>
                <div class="mb-3">
                  <label>Intereses</label>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    id="interests"
                    onChange={handleSelectChange}
                    required
                  >
                    <option>Seleccione</option>
                    <option value="Lectura">Lectura</option>
                    <option value="Fiestas">Fiestas</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Charla">Charla</option>
                    <option value="Comida">Comida</option>
                  </select>
                </div>

                <div>
                  {interests.map((option) => (
                    <ul key={option}>
                      {option} <span>&#10003;</span>
                    </ul>
                  ))}
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="Correo electronico"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Contraseña"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label>Foto de perfil</label>
                  <input
                    type="file"
                    id="photo"
                    onChange={onChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="ct-btn-primary">
                    Registrarse
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* <!-- IMAGEN --> */}
          <div className="col container-imagen justify-content-center">
            <div className="image w-100"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
