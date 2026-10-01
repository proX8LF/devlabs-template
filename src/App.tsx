import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LangProvider } from "@/lib/i18n";
import { getSession } from "@/lib/auth";
import { DashboardChrome } from "@/components/ui";
import Landing from "@/pages/Landing";
import DashboardHome from "@/pages/DashboardHome";
import ItemsList from "@/pages/ItemsList";
import ItemNew from "@/pages/ItemNew";
import ItemDetail from "@/pages/ItemDetail";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!getSession()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function DashboardRoutes() {
  return (
    <RequireAuth>
      <DashboardChrome email={getSession()?.email ?? ""}>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="items" element={<ItemsList />} />
          <Route path="items/new" element={<ItemNew />} />
          <Route path="items/:id" element={<ItemDetail />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DashboardChrome>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <a className="skip" href="#main">Skip</a>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LangProvider>
    </BrowserRouter>
  );
}
