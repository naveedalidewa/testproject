import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import MainContent from "./components/MainContent";
import PurchaseOrder from "./components/PurchaseOrder";
import PurchaseOrderForm from "./components/PurchaseOrderForm";
import ItemsList from "./components/items/ItemsList";
import InventoryAdjustment from "./components/inventoryadjustment/InventoryAdjustment";
import Login from "./components/Login";
import LocationSelector from "./components/LocationSelector";
import ProtectedRoute from "./components/ProtectedRoute";
import SetupsMain from "./components/setups/SetupsMain";

// Dashboard layout component
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract current view from URL path
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path.includes("/dashboard/")) {
      // Return the full path after /dashboard/ to support nested routes
      return path.split("/dashboard/")[1];
    }
    return "dashboard";
  };

  const currentView = getCurrentView();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (menuItem) => {
    navigate(`/dashboard/${menuItem}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onMenuClick={handleMenuClick}
          currentView={currentView}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Routes>
            <Route index element={<MainContent />} />
            <Route path="purchase-order/*" element={<PurchaseOrderRoutes />} />
            <Route path="items" element={<ItemsList />} />
            <Route
              path="inventory-adjustment"
              element={<InventoryAdjustment />}
            />
            <Route
              path="price-level"
              element={<div className="p-6">Price Level Page</div>}
            />
            <Route
              path="categories"
              element={<div className="p-6">Categories Page</div>}
            />
            <Route
              path="item-audit"
              element={<div className="p-6">Item Audit Page</div>}
            />
            <Route
              path="promotions"
              element={<div className="p-6">Promotions Page</div>}
            />
            <Route
              path="sales"
              element={<div className="p-6">Sales Page</div>}
            />
            <Route
              path="finances"
              element={<div className="p-6">Finances Page</div>}
            />
            <Route
              path="employee"
              element={<div className="p-6">Employee Page</div>}
            />
            <Route
              path="lottery-management"
              element={<div className="p-6">Lottery Management Page</div>}
            />
            <Route
              path="loyalty-management"
              element={<div className="p-6">Loyalty Management Page</div>}
            />
            <Route
              path="reports"
              element={<div className="p-6">Reports Page</div>}
            />
            <Route path="setups" element={<SetupsMain />} />
          </Routes>
          {currentView === "dashboard" && <Footer />}
        </div>
      </div>
    </div>
  );
};

// Purchase Order nested routes component
const PurchaseOrderRoutes = () => {
  const [editingPO, setEditingPO] = useState(null);
  const [newPOData, setNewPOData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreatePO = (purchaseOrderId, basicInfo) => {
    // Store the new PO data and navigate to create form
    setNewPOData({ id: purchaseOrderId, ...basicInfo });
    navigate("/dashboard/purchase-order/create");
  };

  const handleEditPO = (poData) => {
    setEditingPO(poData);
    navigate("/dashboard/purchase-order/edit", { state: { editData: poData } });
  };

  const handleBackToList = () => {
    navigate("/dashboard/purchase-order");
    setEditingPO(null);
    setNewPOData(null);
  };

  // Get edit data from navigation state or existing state
  const getEditData = () => {
    return location.state?.editData || editingPO;
  };

  return (
    <Routes>
      <Route
        index
        element={
          <PurchaseOrder onCreateNew={handleCreatePO} onEditPO={handleEditPO} />
        }
      />
      <Route
        path="create"
        element={
          <PurchaseOrderForm onBack={handleBackToList} newPOData={newPOData} />
        }
      />
      <Route
        path="edit"
        element={
          <PurchaseOrderForm
            onBack={handleBackToList}
            editData={getEditData()}
          />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/locations"
              element={
                <ProtectedRoute>
                  <LocationSelector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute requireLocation>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
