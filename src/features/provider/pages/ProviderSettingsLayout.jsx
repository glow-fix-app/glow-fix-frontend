import React, { useEffect } from "react";
import { useLocation, Link, Outlet, useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon, CreditCardIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function ProviderSettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootPath = location.pathname === "/provider/settings" || location.pathname === "/provider/settings/";

  useEffect(() => {
    if (isRootPath && window.innerWidth >= 768) {
      navigate("account", { replace: true });
    }
  }, [isRootPath, navigate]);

  const tabs = [
    { id: "account", path: "account", label: "Account Info", icon: UserIcon },
    { id: "security", path: "security", label: "Password & Security", icon: LockClosedIcon },
    { id: "billing", path: "billing", label: "Bank Account Details", icon: CreditCardIcon },
    { id: "documents", path: "documents", label: "Verification Documents", icon: DocumentTextIcon },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className={`w-full md:w-64 shrink-0 ${!isRootPath ? "hidden md:block" : ""}`}>
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const isActive = location.pathname.includes(`/provider/settings/${tab.path}`);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 md:py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? "bg-[#f4f7fa] text-brand-600" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-white md:bg-transparent shadow-sm md:shadow-none border border-gray-100 md:border-none"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand-600" : "text-gray-400"}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className={`flex-1 min-w-0 pb-8 ${isRootPath ? "hidden md:block" : ""}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
