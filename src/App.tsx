import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Sistema from "./pages/Sistema.tsx";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Rota principal mostra o LoginForm (através do Index) */}
        <Route path="/" element={<Index />} />
        
        {/* Sistema protegido */}
        <Route path="/sistema" element={<Sistema />} />
        
        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;