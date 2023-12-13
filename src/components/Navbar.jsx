import { useState } from "react";
import CreateEvents from "../pages/CreateEvents";

const Navbar = ({ onProfileClick, onSearchChange}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);

  };
  return (
    <>
      {/** NAV-BAR */}
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid d-flex justify-content-center">
          {/* ICONO Y LABEL */}
          <div className="col pb-2 pb-md-0">
            <a className="navbar-brand" href="#">
              <span className="span-decoration-2">Go</span>
              <span className="span-decoration">Event</span>
            </a>
          </div>
          {/* BUSCADOR */}
          <div className="col-10 col-md-4 pe-2 ps-2">
            <form className="d-flex" role="search">
              <input
                className="form-control color-border me-2 ct-center"
                type="search"
                placeholder="Buscar un evento"
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>
          </div>
          {/* OPCIONES */}
          <div className="col">
            <div className="d-flex pt-0 pt-sm-2 pt-md-0 pe-0 pe-sm-2 pe-md-0">
              {/* pe-sm-2 */}
              <div className="col-auto me-auto" />
              <div className="d-flex ">
                <button
                  type="button"
                  className="ct-btn-primary d-flex agregar justify-content-center align-items-center ct-btn ms-4"
                  onClick={openModal}
                >
                  <span className="material-symbols-outlined">add</span>
                  <span className="d-none d-sm-flex d-md-flex ps-2">
                    Agregar
                  </span>
                </button>

                <button
                  type="button"
                  className="ct-btn-primary d-flex  justify-content-center align-items-center ct-btn ms-4"
                  onClick={onProfileClick}
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  <span className="d-none d-sm-flex d-md-flex ps-2">
                    Perfil
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <CreateEvents isOpen={isModalOpen} closeModal={closeModal} />
      )}
    </>
  );
};

export default Navbar;
