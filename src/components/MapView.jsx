import { MapContainer, TileLayer } from "react-leaflet";

const MapView = () => {
  return (
    <>
      {/** RENDER */}
      <MapContainer className="render" center={[10.63504, -85.43772]} zoom={9}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </>
  );
};

export default MapView;
