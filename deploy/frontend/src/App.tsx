import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './scenes/layout/index.tsx';
import { themeSettings } from './theme.tsx';

import Dashboard from '@/scenes/dashboard';
import Login from '@/scenes/login';
import Person from '@/scenes/personManagement';
import AddPerson from '@/scenes/personManagement/AddPerson.tsx';
import EditPerson from '@/scenes/personManagement/EditPerson.tsx';
import ProfilePage from '@/scenes/personManagement/ProfilePage.tsx';
import ResetPasswordPage from '@/scenes/personManagement/ResetPasswordPage.tsx';
import WorkplaceCategoryList from '@/scenes/workplaceCategoryManagement';
import AddWorkplaceCategory from '@/scenes/workplaceCategoryManagement/AddWorkplaceCategory.tsx';
import EditWorkplaceCategory from '@/scenes/workplaceCategoryManagement/EditWorkplaceCategory.tsx';
import WorkplaceManagement from '@/scenes/workplaceManagement';
import AddWorkplace from '@/scenes/workplaceManagement/AddWorkplace.tsx';
import EditWorkplace from '@/scenes/workplaceManagement/EditWorkplace.tsx';
import { RootState } from '@/state/store.ts';
import { selectThemeMode } from '@/state/theme/theme.selectors.ts';
import { ThemeMode } from '@/state/theme/theme.types.ts';

function App() {
  const mode: ThemeMode = useSelector((theme: RootState) =>
    selectThemeMode(theme)
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/person" element={<Person />} />
              <Route path="/addPerson" element={<AddPerson />} />
              <Route path="/editPerson/:id" element={<EditPerson />} />
              <Route path="/profilePage" element={<ProfilePage />} />
              <Route path="/passwordReset" element={<ResetPasswordPage />} />
              <Route path="/workplace" element={<WorkplaceManagement />} />
              <Route path="/addWorkplace" element={<AddWorkplace />} />
              <Route path="/editWorkplace/:id" element={<EditWorkplace />} />
              <Route
                path="/workplaceCategories"
                element={<WorkplaceCategoryList />}
              />
              <Route
                path="/addWorkplaceCategory"
                element={<AddWorkplaceCategory />}
              />
              <Route
                path="/editWorkplaceCategory/:id"
                element={<EditWorkplaceCategory />}
              />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}
export default App;
