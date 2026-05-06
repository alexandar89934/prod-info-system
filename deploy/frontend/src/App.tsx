import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './scenes/layout/index.tsx';
import AddMachine from './scenes/machineManagement/machine/addMachine.tsx';
import EditMachine from './scenes/machineManagement/machine/editMachine.tsx';
import MachineList from './scenes/machineManagement/machine/index.tsx';
import MachinePage from './scenes/machineManagement/machine/machinePage.tsx';
import MachineEquipmentList from './scenes/machineManagement/machineEquipment/index.tsx';
import { themeSettings } from './theme.tsx';

import ProtectedRoute from '@/reusableComponents/ProtectedRoute.tsx';
import AttendanceManagement from '@/scenes/attendanceManagement';
import Dashboard from '@/scenes/dashboard';
import AddItem from '@/scenes/itemManagement/item/addItem.tsx';
import EditItem from '@/scenes/itemManagement/item/editItem.tsx';
import ItemList from '@/scenes/itemManagement/item/index.tsx';
import ItemPage from '@/scenes/itemManagement/item/ItemPage.tsx';
import PackagingUnitList from '@/scenes/itemManagement/packagingUnit/index.tsx';
import AddPackagingUnit from '@/scenes/itemManagement/packagingUnit/addPackagingUnit.tsx';
import EditPackagingUnit from '@/scenes/itemManagement/packagingUnit/editPackagingUnit.tsx';
import JobPositionCategoryList from '@/scenes/jobPositionCategoryManagement';
import AddJobPositionCategory from '@/scenes/jobPositionCategoryManagement/AddJobPositionCategory.tsx';
import EditJobPositionCategory from '@/scenes/jobPositionCategoryManagement/EditJobPositionCategory.tsx';
import JobPositionList from '@/scenes/jobPositionManagement';
import AddJobPosition from '@/scenes/jobPositionManagement/AddJobPosition.tsx';
import EditJobPosition from '@/scenes/jobPositionManagement/EditJobPosition.tsx';
import Kiosk from '@/scenes/kiosk';
import Login from '@/scenes/login';
import MachineAvailabilityStatusList from '@/scenes/machineManagement/machineAvailabilityStatus';
import AddMachineAvailabilityStatus from '@/scenes/machineManagement/machineAvailabilityStatus/addMachineAvailabilityStatus.tsx';
import EditMachineAvailabilityStatus from '@/scenes/machineManagement/machineAvailabilityStatus/editMachineAvailabilityStatus.tsx';
import AddMachineEquipment from '@/scenes/machineManagement/machineEquipment/addMachineEquipment.tsx';
import EditMachineEquipment from '@/scenes/machineManagement/machineEquipment/editMachineEquipment.tsx';
import MachineEquipmentPage from '@/scenes/machineManagement/machineEquipment/machineEquipmentPage.tsx';
import MachineEquipmentTypeList from '@/scenes/machineManagement/machineEquipmentTypes';
import AddMachineEquipmentType from '@/scenes/machineManagement/machineEquipmentTypes/addMachineEquipmentTypes.tsx';
import EditMachineEquipmentType from '@/scenes/machineManagement/machineEquipmentTypes/editMachineEquipmentTypes.tsx';
import MoldList from '@/scenes/moldManagement/mold/index.tsx';
import AddMold from '@/scenes/moldManagement/mold/addMold.tsx';
import EditMold from '@/scenes/moldManagement/mold/editMold.tsx';
import MoldPage from '@/scenes/moldManagement/mold/MoldPage.tsx';
import SystemConfigPage from '@/scenes/systemConfig';
import Person from '@/scenes/personManagement';
import AddPerson from '@/scenes/personManagement/AddPerson.tsx';
import EditPerson from '@/scenes/personManagement/EditPerson.tsx';
import PersonPage from '@/scenes/personManagement/PersonPage.tsx';
import ProfilePage from '@/scenes/personManagement/ProfilePage.tsx';
import ResetPasswordPage from '@/scenes/personManagement/ResetPasswordPage.tsx';
import ResponsibilityList from '@/scenes/responsibilityManagement';
import AddResponsibility from '@/scenes/responsibilityManagement/AddResponsibility.tsx';
import EditResponsibility from '@/scenes/responsibilityManagement/EditResponsibility.tsx';
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
              <Route
                path="/person"
                element={
                  <ProtectedRoute>
                    <Person />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/person/:id"
                element={
                  <ProtectedRoute>
                    <PersonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addPerson"
                element={
                  <ProtectedRoute>
                    <AddPerson />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editPerson/:id"
                element={
                  <ProtectedRoute>
                    <EditPerson />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profilePage"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passwordReset"
                element={
                  <ProtectedRoute>
                    <ResetPasswordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobPosition"
                element={
                  <ProtectedRoute>
                    <JobPositionList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addJobPosition"
                element={
                  <ProtectedRoute>
                    <AddJobPosition />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editJobPosition/:id"
                element={
                  <ProtectedRoute>
                    <EditJobPosition />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobPositionCategories"
                element={
                  <ProtectedRoute>
                    <JobPositionCategoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addJobPositionCategory"
                element={
                  <ProtectedRoute>
                    <AddJobPositionCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editJobPositionCategory/:id"
                element={
                  <ProtectedRoute>
                    <EditJobPositionCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machineAvailabilityStatus"
                element={
                  <ProtectedRoute>
                    <MachineAvailabilityStatusList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addMachineAvailabilityStatus"
                element={
                  <ProtectedRoute>
                    <AddMachineAvailabilityStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editMachineAvailabilityStatus/:id"
                element={
                  <ProtectedRoute>
                    <EditMachineAvailabilityStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machineEquipmentTypes"
                element={
                  <ProtectedRoute>
                    <MachineEquipmentTypeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addMachineEquipmentType"
                element={
                  <ProtectedRoute>
                    <AddMachineEquipmentType />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editMachineEquipmentType/:id"
                element={
                  <ProtectedRoute>
                    <EditMachineEquipmentType />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machineEquipment"
                element={
                  <ProtectedRoute>
                    <MachineEquipmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machineEquipment/:id"
                element={
                  <ProtectedRoute>
                    <MachineEquipmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addMachineEquipment"
                element={
                  <ProtectedRoute>
                    <AddMachineEquipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editMachineEquipment/:id"
                element={
                  <ProtectedRoute>
                    <EditMachineEquipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/responsibilities"
                element={
                  <ProtectedRoute>
                    <ResponsibilityList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addResponsibility"
                element={
                  <ProtectedRoute>
                    <AddResponsibility />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editResponsibility/:id"
                element={
                  <ProtectedRoute>
                    <EditResponsibility />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machine"
                element={
                  <ProtectedRoute>
                    <MachineList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machine/:id"
                element={
                  <ProtectedRoute>
                    <MachinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addMachine"
                element={
                  <ProtectedRoute>
                    <AddMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editMachine/:id"
                element={
                  <ProtectedRoute>
                    <EditMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mold"
                element={
                  <ProtectedRoute>
                    <MoldList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mold/:id"
                element={
                  <ProtectedRoute>
                    <MoldPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addMold"
                element={
                  <ProtectedRoute>
                    <AddMold />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editMold/:id"
                element={
                  <ProtectedRoute>
                    <EditMold />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/item"
                element={
                  <ProtectedRoute>
                    <ItemList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/item/:id"
                element={
                  <ProtectedRoute>
                    <ItemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addItem"
                element={
                  <ProtectedRoute>
                    <AddItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editItem/:id"
                element={
                  <ProtectedRoute>
                    <EditItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packaging-unit"
                element={
                  <ProtectedRoute>
                    <PackagingUnitList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addPackagingUnit"
                element={
                  <ProtectedRoute>
                    <AddPackagingUnit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editPackagingUnit/:id"
                element={
                  <ProtectedRoute>
                    <EditPackagingUnit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <AttendanceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system-config"
                element={
                  <ProtectedRoute>
                    <SystemConfigPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* Kiosk — full screen, no layout */}
            <Route path="/kiosk" element={<Kiosk />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}
export default App;
