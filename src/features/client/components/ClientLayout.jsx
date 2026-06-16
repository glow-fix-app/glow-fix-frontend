import { Outlet, useLocation } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import Footer from "./Footer";
import ForceLocationModal from "./ForceLocationModal";

export default function ClientLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNavbar />
      <main className="flex flex-1 flex-col">
        <div className={isHome ? "flex w-full flex-1 flex-col" : "mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8"}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <ForceLocationModal />
    </div>
  );
}
