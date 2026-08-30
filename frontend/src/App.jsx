import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RetailerView from "./pages/RetailerView";
import DispatcherView from "./pages/DispatcherView";
import RiderView from "./pages/RiderView";
import { getSession } from "./session";

function RequireRole({ role, children }) {
  const session = getSession();
  if (!session) return <Navigate to="/" replace />;
  if (session.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/retailer"
          element={
            <RequireRole role="retailer">
              <RetailerView />
            </RequireRole>
          }
        />
        <Route
          path="/dispatcher"
          element={
            <RequireRole role="dispatcher">
              <DispatcherView />
            </RequireRole>
          }
        />
        <Route
          path="/rider"
          element={
            <RequireRole role="rider">
              <RiderView />
            </RequireRole>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
