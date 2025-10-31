import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Componente temporário para teste
const Index = () => (
  <div style={{ 
    padding: '40px', 
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      background: 'white',
      padding: '50px',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      textAlign: 'center',
      maxWidth: '600px'
    }}>
      <div style={{ fontSize: '80px', marginBottom: '30px' }}>🏢</div>
      <h1 style={{ 
        fontSize: '3rem', 
        fontWeight: 'bold', 
        color: '#1f2937',
        marginBottom: '15px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        CGPL Soluções
      </h1>
      <p style={{ 
        fontSize: '1.4rem', 
        color: '#6b7280',
        marginBottom: '40px'
      }}>
        Sistema de Chamados Prediais
      </p>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
      }}>
        ✅ SISTEMA CARREGADO COM SUCESSO!
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontWeight: 'bold', color: '#0369a1' }}>React</div>
          <div style={{ color: '#0ea5e9', fontSize: '14px' }}>Funcionando</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
          <div style={{ fontWeight: 'bold', color: '#166534' }}>Vite</div>
          <div style={{ color: '#16a34a', fontSize: '14px' }}>Funcionando</div>
        </div>
        <div style={{ background: '#fef7ed', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💫</div>
          <div style={{ fontWeight: 'bold', color: '#9a3412' }}>TypeScript</div>
          <div style={{ color: '#ea580c', fontSize: '14px' }}>Funcionando</div>
        </div>
        <div style={{ background: '#faf5ff', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
          <div style={{ fontWeight: 'bold', color: '#7c3aed' }}>Tailwind</div>
          <div style={{ color: '#8b5cf6', fontSize: '14px' }}>Funcionando</div>
        </div>
      </div>

      <button 
        onClick={() => alert('Sistema CGPL Soluções funcionando perfeitamente! 🎉\n\nPróximo passo: Configurar os componentes UI.')}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          padding: '15px 40px',
          borderRadius: '10px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.6)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
        }}
      >
        Testar Sistema
      </button>

      <p style={{ 
        marginTop: '25px', 
        color: '#9ca3af',
        fontSize: '0.8rem'
      }}>
        React 18 • TypeScript • Vite • Tailwind CSS
      </p>
    </div>
  </div>
);

// Página 404 temporária
const NotFound = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>404 - Página Não Encontrada</h1>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;