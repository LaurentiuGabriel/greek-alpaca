import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import GreeksPage from './pages/GreeksPage';
import ExposurePage from './pages/ExposurePage';
import HedgingPage from './pages/HedgingPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/greeks" element={<GreeksPage />} />
            <Route path="/exposure" element={<ExposurePage />} />
            <Route path="/hedging" element={<HedgingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </PortfolioProvider>
    </BrowserRouter>
  );
}
