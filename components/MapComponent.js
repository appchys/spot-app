// components/MapComponent.js
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

const MapResize = dynamic(() =>
  import("react-leaflet").then((mod) => {
    return function MapResize({ lat, lng }) {
      const map = mod.useMap();
      React.useEffect(() => {
        if (lat && lng) {
          setTimeout(() => {
            map.invalidateSize();
            map.setView([lat, lng], 13);
          }, 100);
        }
      }, [map, lat, lng]);
      return null;
    };
  }),
  { ssr: false }
);

export default function MapComponent({ lat, lng }) {
  return (
    <div className="map-container" style={{ height: "200px", width: "100%", marginBottom: "15px" }}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: "150%", width: "250%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]} />
        <MapResize lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}