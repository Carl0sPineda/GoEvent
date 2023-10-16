import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../firebase";

export default function Profile(){

    const auth = getAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const { name, email, phone, location,  } = formData;

    function onLogout() {
      auth.signOut();
      navigate("/");
    }

    useEffect(()=> {
    async function fetchUserData() {
        try {
          const docRef = doc(db, "users",auth?.currentUser?.uid);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();

            setFormData(userData);
            // Now you can access additional user data from `userData` object
            console.log("Additional User Data:", userData.phone);
          } else {
            console.log("User data not found in Firestore");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      // Call this function when you need to fetch user data
      fetchUserData();

    },[])

   
    return(

        <>
        <div className="container mt-4">
  <h1 className="font-monospace text-xl text-primary mt-6">My Info</h1>

  <input
    type="text"
    value={name}
    readOnly
    className="mt-4 form-control"
    style={{ width: '320px' }} // Ajusta el ancho según tus necesidades
  />

  <input
    type="text"
    value={email}
    readOnly
    className="mt-4 form-control"
    style={{ width: '320px' }} // Ajusta el ancho según tus necesidades
  />

<input
    type="text"
    value={phone}
    readOnly
    className="mt-4 form-control"
    style={{ width: '320px' }} // Ajusta el ancho según tus necesidades
  />

  
<input
    type="text"
    value={location}
    readOnly
    className="mt-4 form-control"
    style={{ width: '320px' }} // Ajusta el ancho según tus necesidades
  />


  <div className="mt-2">
    <p onClick={onLogout} className="text-primary cursor-pointer">
      Sign out
    </p>
  </div>
</div>
        </>
    );

}