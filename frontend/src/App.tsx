import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CRM from './pages/CRM';
import TimeTracking from './pages/TimeTracking';
import Tickets from './pages/Tickets';
import Inventory from './pages/Inventory';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import OfferCreate from './pages/OfferCreate';
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
        <Route path="time-tracking" element={<TimeTracking />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="offers" element={<Offers />} />
        <Route path="offers/create" element={<OfferCreate />} />
        <Route path="offers/:id" element={<OfferDetail />} />
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
      </Route>
    </Routes>
  );
}

export default App;

