import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CRM from './pages/CRM';
import Tickets from './pages/Tickets';
import Inventory from './pages/Inventory';
import InventoryIncoming from './pages/InventoryIncoming';
import InventoryOutgoing from './pages/InventoryOutgoing';
import InventoryLog from './pages/InventoryLog';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import OfferCreate from './pages/OfferCreate';
import OfferEditor from './pages/OfferEditor';
import Invoices from './pages/Invoices';
import SalesOrders from './pages/SalesOrders';
import PurchaseOrders from './pages/PurchaseOrders';
import Timesheets from './pages/Timesheets';
import Assets from './pages/Assets';
import Users from './pages/Users';
import Settings from './pages/Settings';
import ProjectDetail from './pages/ProjectDetail';
import PipelineView from './pages/PipelineView';
import PipelineKanban from './pages/PipelineKanban';
import PlanningScheduler from './pages/PlanningScheduler';
import PersonalCalendar from './pages/PersonalCalendar';
import Tasks from './pages/Tasks';
import Sales from './pages/Sales';
import DataQuality from './pages/DataQuality';
import AuditLogs from './pages/AuditLogs';
import ContactDetail from './pages/ContactDetail';
import Accounting from './pages/Accounting';
import OfferTemplates from './pages/OfferTemplates';
import KanbanBoards from './pages/KanbanBoards';
import CustomKanbanBoard from './pages/CustomKanbanBoard';
import Layout from './components/common/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="pipelines/:type" element={<PipelineView />} />
        <Route path="pipelines/:type/:step" element={<PipelineView />} />
        <Route path="pipelines/:type/kanban" element={<PipelineKanban />} />
        <Route path="crm" element={<CRM />} />
        <Route path="crm/contacts/:id" element={<ContactDetail />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="offers" element={<Offers />} />
        <Route path="offers/create" element={<OfferCreate />} />
        <Route path="offers/:id" element={<OfferDetail />} />
        <Route path="offers/:id/edit" element={<OfferEditor />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="sales-orders" element={<SalesOrders />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="timesheets" element={<Timesheets />} />
        <Route path="assets" element={<Assets />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="planning/scheduler" element={<PlanningScheduler />} />
        <Route path="planning/planner" element={<PlanningScheduler />} />
        <Route path="calendar" element={<PersonalCalendar />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="sales" element={<Sales />} />
        <Route path="governance/data-quality" element={<DataQuality />} />
        <Route path="governance/audit-logs" element={<AuditLogs />} />
        {/* Buchhaltung und Vorlagen */}
        <Route path="accounting" element={<Accounting />} />
        <Route path="offer-templates" element={<OfferTemplates />} />
        <Route path="documents/templates" element={<OfferTemplates />} />
        {/* Dashboard Alternative */}
        <Route path="dashboard" element={<Dashboard />} />
        {/* Artikelstamm - Weiterleitung zur Inventory mit Tab-Auswahl */}
        <Route path="articles" element={<Navigate to="/inventory?tab=0" replace />} />
        <Route path="services" element={<Navigate to="/inventory?tab=1" replace />} />
        <Route path="sales-prices" element={<Navigate to="/inventory?tab=2" replace />} />
        {/* Lager-Module */}
        <Route path="inventory/incoming" element={<InventoryIncoming />} />
        <Route path="inventory/outgoing" element={<InventoryOutgoing />} />
        <Route path="inventory/log" element={<InventoryLog />} />
        {/* Kanban Boards */}
        <Route path="kanban-boards" element={<KanbanBoards />} />
        <Route path="kanban-boards/gewerk/:gewerk" element={<CustomKanbanBoard />} />
        <Route path="kanban-boards/:boardId" element={<CustomKanbanBoard />} />
      </Route>
    </Routes>
  );
}

export default App;

