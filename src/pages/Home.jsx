import Filters from "../components/Filters";
import MapView from "../components/MapView";
import Navbar from "../components/Navbar";
import ProfileModal from "../components/ProfileModal";
import { useState } from "react";
import Footer from "./Footer";

export default function Home() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };
  return (
    <>
      <Navbar onProfileClick={handleProfileClick} />
      <ProfileModal show={isProfileModalOpen} onClose={closeProfileModal} />
      <Filters setSelectedFilters={setSelectedFilters} />
      <MapView selectedFilters={selectedFilters} />
      <Footer />
    </>
  );
}
