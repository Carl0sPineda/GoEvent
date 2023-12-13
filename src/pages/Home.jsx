import Filters from "../components/Filters";
import MapView from "../components/MapView";
import Navbar from "../components/Navbar";
import ProfileModal from "../components/ProfileModal";
import { useState } from "react";
import Footer from "./Footer";

export default function Home() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };
  return (
    <>
      <Navbar onProfileClick={handleProfileClick} searchTerm={searchTerm} onSearchChange={handleSearchChange}/>
      <ProfileModal show={isProfileModalOpen} onClose={closeProfileModal} />
      <Filters setSelectedFilters={setSelectedFilters} />
      <MapView selectedFilters={selectedFilters} searchTerm={searchTerm} />
      <Footer />
    </>
  );
}
