
import SingIn from "./pages/SingIn";
import SingUp from "./pages/SingUp"
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
    <Router>
    <Routes>
    <Route path="/" element={< SingIn/>} />
    <Route path="/SignUp" element={< SingUp/>} />
    <Route path="/Home" element={<Home />} />
    <Route path="/Profile" element={<Profile />}/>
    
    </Routes>
    </Router>

    <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />



    </>
  );
}

export default App;
