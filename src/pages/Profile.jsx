import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: {},
    location: "",
    password: "",
    interests: []
  });
  const [NewInterests, setNewInterests] = useState([]);
  // const [AllInterest, setAllInterest] = useState([]);
  const { name, email, phone,photo, imgUrls, location , interests} = formData;
  const auth = getAuth();
  const navigate = useNavigate();


  useEffect(() => {
    async function fetchUserData() {
      try {
        const docRef = doc(db, "users", auth?.currentUser?.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();

          setFormData({...userData});

          // Now you can access additional user data from `userData` object
          // console.log("Additional User Data:", userData.phone);
        } else {
          console.log("User data not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    // Call this function when you need to fetch user data
    fetchUserData();
  }, []);


  function onChange(e){
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    //files
    if (e.target.files) {
      //Used for preview the image before upload files[0]
      //   console.log(geolocation);
      // let filesS = e.target.files;
      // setSelectedImage(e.target.files);
      // selectedImage = e.target.files;

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
  }

  const handleSelectChange = (event) => {

    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
  
    // Crear una copia de los intereses existentes en formData
    const updatedInterests = [...interests, ...selectedOptions];
  
    // Actualizar formData con los nuevos intereses
    setFormData({ ...formData, interests: updatedInterests });
  
    // Actualizar NewInterests para reflejar los cambios
    setNewInterests(updatedInterests);
  }
  


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
      // const imgUrls = await Promise.all(
      //   [...photo].map((image) => storeFile(image))
      // ).catch((error) => {
      //   setLoading(false);
      //   toast.error("Images not uploaded");
      //   return;
      // });

     
        if (photo) {
          const imgUrls = await Promise.all(
            [...photo].map((image) => storeFile(image))
          );
        }else{
          const imgUrls = photo
        }


     
      // const userCredentials = await createUserWithEmailAndPassword(
      //   auth,
      //   email,
      //   password
      // );

      // updateProfile(auth.currentUser, {
      //   displayName: name,
      // });

      // const user = userCredentials.user;
    
      const formDataCopy = { ...formData,imgUrls };
      delete formDataCopy.photo;
      delete formDataCopy.password;
    

      const docRef= doc(db,"users",auth?.currentUser?.uid);
      await updateDoc(docRef,formDataCopy);
      navigate("/home");
      toast.success("Datos Editados!!!");
    
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
    <>
    <button type="button" className="ct-btn-primary"
    onClick={()=> navigate("/home")}
    >Regresar</button>
<section>
      <div className="container-fluid vh-100 bg-white d-flex justify-content-center align-items-center">
        <div className="container-principal row row-cols-1 row-cols-md-2">

        <div class="col container-nueva-columna modal-with-background">
       
        <div className="text-center text-white">
            <img className="imgP mt-4" src={imgUrls} alt="" />
            <div className="mt-3">
            <p style={{ fontWeight: 'bold' }}>{name}</p>
            </div>
            <div className='mt-4'>
            <p style={{ fontWeight: 'bold' }}>Intereses</p>
            {interests.map((interest, index) => (
              <span className='d-block' key={index}>{interest}</span>
             ))}
            
            </div>
            
            </div>
        </div>
          <div className="col container-formulario">
            {/* <!-- TITULO Y LOGO --> */}
            <div className="row justify-content-center align-items-lg-center p-2">
              {/* <h4 className="text-align-center mt-2">Crea tu cuenta</h4> */}
            </div>
            {/* <!-- FORMULARIO --> */}
            <div className="row p-2">
              <div>
                <div className="text-center">
                  <labael>Editar Mi Perfil</labael>
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
                    value={interests}
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
                  <label>Foto de perfil</label>
                  <input
                    type="file"
                    id="photo"
                    onChange={onChange}
                    
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

        </div>
      </div>
      
</section>


    </>
  );
}
