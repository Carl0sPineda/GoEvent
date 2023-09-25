const Filters = () => {
  return (
    <>
      {/* FILTRO */}
      <section className="row flex-wrap p-4 justify-content-evenly justify-content-lg-center">
        <div className=" col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex "
          >
            <span className="material-symbols-outlined pe-0 pe-md-2 ">
              book
            </span>
            <span className="d-none d-md-block">Lectura</span>
            {/*- Crear evento  */}
          </button>
        </div>
        <div className="col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center   ">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex"
          >
            <span className="material-symbols-outlined pe-0 pe-md-2">
              sports_soccer
            </span>
            <span className="d-none d-md-block">Partidos</span>
            {/*- Crear evento  */}
          </button>
        </div>
        <div className="col-1 col-md-1 col-lg-2 col-xl-1  d-flex  justify-content-center align-content-center align-items-center  ">
          <button
            type="button"
            className="ct-btn-secundary align-items-center d-flex"
          >
            <span className="material-symbols-outlined pe-0 pe-md-2">
              nightlife
            </span>
            <span className="d-none d-md-block">Bailes</span>
            {/*- Crear evento  */}
          </button>
        </div>
      </section>
      {/* FIN FILTRO/// */}
    </>
  );
};

export default Filters;