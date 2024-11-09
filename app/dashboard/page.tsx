import ProtectedRoute from "../../components/ProtectedRoute";
import Dashboard from "../../components/main/Dashboard";

export default () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);
