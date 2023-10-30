import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function SingIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const navigate = useNavigate();
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e) {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredentials.user) {
        navigate("/Home");
        console.log("login exitoso");
        console.log(auth.currentUser);
        toast.success("Login realizado con éxito!!");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("Debes registrarte primero");
        // console.log("No estas registrado")
      } else {
        toast.error("Credenciales incorrectas");
        // console.log("Credenciales incorrectas")
      }

      console.log(error);
    }
  }

  return (
    <section>
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
        <div className="container-principal row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2">
          <div className="col container-formulario">
            {/* <!-- TITULO Y LOGO --> */}
            <div className="row justify-content-center align-items-lg-center p-2">
              <h3 className="text-align-center" style={{ marginTop: 100 }}>
                Go event
              </h3>
            </div>
            {/* <!-- FORMULARIO --> */}
            <div className="row">
              <div>
                <input id="checkbox_toggle" type="checkbox" className="check" />
                <div className="text-center">
                  <label className="slide w-100">
                    <label className="text" htmlFor="checkbox_toggle">
                      Iniciar sesión
                    </label>
                  </label>
                </div>
              </div>

              <form onSubmit={onSubmit} className="pt-5">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={onChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={onChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="ct-btn-primary">
                    Iniciar Sesión
                  </button>
                </div>

                <div className="text-center mt-3">
                  <Link to="/SignUp">No tienes una cuenta?</Link>
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
