import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import AuthBootstrap from "@/features/auth/components/AuthBootstrap";
import { store } from "./store/store";
import { queryClient } from "@/services/queryClient";
import routes from "@/routes";
import { ToastProvider } from "@heroui/react";

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <ToastProvider placement="top" />
          <RouterProvider router={router} />
        </AuthBootstrap>
      </QueryClientProvider>
    </ReduxProvider>
  );
}






