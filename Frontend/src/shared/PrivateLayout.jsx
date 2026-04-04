import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const PrivateLayout = () => {
  return (
    <div className="private-layout">
      <Navbar />
      <main className="private-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;