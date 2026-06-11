import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

/**
 * Slim layout for the chat page:
 * – Navbar at the top
 * – No footer
 * – No max-width container, no padding
 * – Remaining viewport height filled by the outlet
 */
export default function ClientChatLayout() {
  return (
    <div className="flex flex-col bg-white" style={{ height: "100dvh" }}>
      <PublicNavbar />
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
