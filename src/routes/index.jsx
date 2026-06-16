import NotFound from "@/components/feedback/NotFound";
import Unauthorized from "@/components/feedback/Unauthorized";
import { adminRoutes } from "@/routes/adminRoutes";
import { authRoutes } from "@/routes/authRoutes";
import { publicClientRoutes, protectedClientRoutes, clientChatRoutes } from "@/routes/clientRoutes";
import { providerRoutes } from "@/routes/providerRoutes";
import { ProtectedRoute, RoleRoute } from "@/routes/guards";
import { ROLES } from "@/features/auth/constants/roles";

const routes = [
  authRoutes,
  // Public routes (Home, discover, browse)
  publicClientRoutes,
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={[ROLES.CLIENT]} />,
        children: [protectedClientRoutes, clientChatRoutes],
      },
      {
        element: <RoleRoute roles={[ROLES.ADMIN]} />,
        children: [adminRoutes],
      },
      {
        element: <RoleRoute roles={[ROLES.MANAGER]} />,
        children: [providerRoutes],
      },
    ],
  },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
];

export default routes;






