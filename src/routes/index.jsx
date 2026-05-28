import NotFound from "@/components/feedback/NotFound";
import Unauthorized from "@/components/feedback/Unauthorized";
import { adminRoutes } from "@/routes/adminRoutes";
import { authRoutes } from "@/routes/authRoutes";
import { clientRoutes } from "@/routes/clientRoutes";
import { providerRoutes } from "@/routes/providerRoutes";
import { ProtectedRoute, RoleRoute } from "@/routes/guards";
import { ROLES } from "@/features/auth/constants/roles";

const routes = [
  authRoutes,
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={[ROLES.CLIENT]} />,
        children: [clientRoutes],
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




