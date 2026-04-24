import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './scenes/layout/index.tsx';
import MachineEquipmentList from './scenes/machineManagement/machineEquipment/index.tsx';
import { themeSettings } from './theme.tsx';

import Dashboard from '@/scenes/dashboard';
import JobPositionList from '@/scenes/jobPositionManagement';
import AddJobPosition from '@/scenes/jobPositionManagement/AddJobPosition.tsx';
import EditJobPosition from '@/scenes/jobPositionManagement/EditJobPosition.tsx';
import JobPositionCategoryList from '@/scenes/jobPositionCategoryManagement';
import AddJobPositionCategory from '@/scenes/jobPositionCategoryManagement/AddJobPositionCategory.tsx';
import EditJobPositionCategory from '@/scenes/jobPositionCategoryManagement/EditJobPositionCategory.tsx';
import Login from '@/scenes/login';
import MachineAvailabilityStatusList from '@/scenes/machineManagement/machineAvailabilityStatus';
import AddMachineAvailabilityStatus from '@/scenes/machineManagement/machineAvailabilityStatus/addMachineAvailabilityStatus.tsx';
import EditMachineAvailabilityStatus from '@/scenes/machineManagement/machineAvailabilityStatus/editMachineAvailabilityStatus.tsx';
import AddMachineEquipment from '@/scenes/machineManagement/machineEquipment/addMachineEquipment.tsx';
import EditMachineEquipment from '@/scenes/machineManagement/machineEquipment/editMachineEquipment.tsx';
import MachineEquipmentTypeList from '@/scenes/machineManagement/machineEquipmentTypes';
import AddMachineEquipmentType from '@/scenes/machineManagement/machineEquipmentTypes/addMachineEquipmentTypes.tsx';
import EditMachineEquipmentType from '@/scenes/machineManagement/machineEquipmentTypes/editMachineEquipmentTypes.tsx';
import Person from '@/scenes/personManagement';
import AddPerson from '@/scenes/personManagement/AddPerson.tsx';
import EditPerson from '@/scenes/personManagement/EditPerson.tsx';
import ProfilePage from '@/scenes/personManagement/ProfilePage.tsx';
import ResetPasswordPage from '@/scenes/personManagement/ResetPasswordPage.tsx';
import ProtectedRoute from '@/reusableComponents/ProtectedRoute.tsx';
import { forceLogout } from '@/state/auth/auth.slice.ts';
import { AppDispatch, RootState } from '@/state/store.ts';
import { selectThemeMode } from '@/state/theme/theme.selectors.ts';
import { ThemeMode } from '@/state/theme/theme.types.ts';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const mode: ThemeMode = useSelector((theme: RootState) =>
    selectThemeMode(theme)
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  useEffect(() => {
    const handleForceLogout = () => dispatch(forceLogout());
    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, [dispatch]);
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route path="/person" element={<ProtectedRoute><Person /></ProtectedRoute>} />
              <Route path="/addPerson" element={<ProtectedRoute><AddPerson /></ProtectedRoute>} />
              <Route path="/editPerson/:id" element={<ProtectedRoute><EditPerson /></ProtectedRoute>} />
              <Route path="/profilePage" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/passwordReset" element={<ProtectedRoute><ResetPasswordPage /></ProtectedRoute>} />
              <Route path="/jobPosition" element={<ProtectedRoute><JobPositionList /></ProtectedRoute>} />
              <Route path="/addJobPosition" element={<ProtectedRoute><AddJobPosition /></ProtectedRoute>} />
              <Route path="/editJobPosition/:id" element={<ProtectedRoute><EditJobPosition /></ProtectedRoute>} />
              <Route path="/jobPositionCategories" element={<ProtectedRoute><JobPositionCategoryList /></ProtectedRoute>} />
              <Route path="/addJobPositionCategory" element={<ProtectedRoute><AddJobPositionCategory /></ProtectedRoute>} />
              <Route path="/editJobPositionCategory/:id" element={<ProtectedRoute><EditJobPositionCategory /></ProtectedRoute>} />
              <Route path="/machineAvailabilityStatus" element={<ProtectedRoute><MachineAvailabilityStatusList /></ProtectedRoute>} />
              <Route path="/addMachineAvailabilityStatus" element={<ProtectedRoute><AddMachineAvailabilityStatus /></ProtectedRoute>} />
              <Route path="/editMachineAvailabilityStatus/:id" element={<ProtectedRoute><EditMachineAvailabilityStatus /></ProtectedRoute>} />
              <Route path="/machineEquipmentTypes" element={<ProtectedRoute><MachineEquipmentTypeList /></ProtectedRoute>} />
              <Route path="/addMachineEquipmentType" element={<ProtectedRoute><AddMachineEquipmentType /></ProtectedRoute>} />
              <Route path="/editMachineEquipmentType/:id" element={<ProtectedRoute><EditMachineEquipmentType /></ProtectedRoute>} />
              <Route path="/machineEquipment" element={<ProtectedRoute><MachineEquipmentList /></ProtectedRoute>} />
              <Route path="/addMachineEquipment" element={<ProtectedRoute><AddMachineEquipment /></ProtectedRoute>} />
              <Route path="/editMachineEquipment/:id" element={<ProtectedRoute><EditMachineEquipment /></ProtectedRoute>} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}
export default App;