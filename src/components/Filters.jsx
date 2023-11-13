const Filters = ({ setSelectedFilters }) => {
  const handleFilterClick = (category) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(category)
        ? prevFilters.filter((filter) => filter !== category)
        : [...prevFilters, category]
    );
  };

  return (
    <>
      {/* FILTRO */}
      <section className="row flex-wrap p-4 justify-content-evenly justify-content-lg-center">
        <div className=" col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center">
      <button
      type="button"
      className="ct-btn-secundary align-items-center d-flex"
      onClick={() => handleFilterClick('Lectura')}
      >
        <span className="material-symbols-outlined pe-0 pe-md-2 ">
              book
        </span>
            <span className="d-none d-md-block">Lectura</span>
     </button>
          
        </div>
        <div className="col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center   ">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex"
            onClick={() => handleFilterClick('Deportes')}
          >
            <span className="material-symbols-outlined pe-0 pe-md-2">
              sports_soccer
            </span>
            <span className="d-none d-md-block">Deportes</span>
            {/*- Crear evento  */}
          </button>
        </div>
        <div className="col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center  ">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex"
            onClick={() => handleFilterClick('Fiestas')}
          >
            <span className="material-symbols-outlined pe-0 pe-md-2">
              celebration
            </span>
            <span className="d-none d-md-block">Fiestas</span>
            {/*- Crear evento  */}
          </button>
        </div>

        <div className="col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center   ">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex"
            onClick={() => handleFilterClick('Comidas')}
          >
            <span className="material-symbols-outlined pe-0 pe-md-2">
              restaurant
            </span>
            <span className="d-none d-md-block">Comidas</span>
            {/*- Crear evento  */}
          </button>
        </div>

        <div className="col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center   ">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex"
            onClick={() => handleFilterClick('Charla')}
          >
            <span className="material-symbols-outlined pe-0 pe-md-2">
              partner_exchange
            </span>
            <span className="d-none d-md-block">Charla</span>
            {/*- Crear evento  */}
          </button>
        </div>
      </section>
      {/* FIN FILTRO/// */}
    </>
  );
};

export default Filters;
