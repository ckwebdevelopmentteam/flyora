import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to workspace
      </a>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div id="workspace-shell" className="workspace-main">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="workspace-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
