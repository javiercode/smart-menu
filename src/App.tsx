import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminPage } from './pages/AdminPage';

// Dynamically determine the basename when deployed to GitHub Pages subdirectory
const getBasename = (): string => {
  const path = window.location.pathname;
  const hostname = window.location.hostname;
  
  if (hostname.endsWith('.github.io')) {
    const repoName = path.split('/')[1];
    return repoName ? `/${repoName}` : '';
  }
  return '';
};

function App() {
  return (
    <BrowserRouter basename={getBasename()}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* Redirect any other path to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
