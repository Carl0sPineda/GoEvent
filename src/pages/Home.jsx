import Filters from "../components/Filters";
import MapView from "../components/MapView";
import Navbar from "../components/Navbar";



export default function Home(){

    return(

        <div>
         <Navbar />
        <Filters />
        <MapView />
        </div>
     

    );
}