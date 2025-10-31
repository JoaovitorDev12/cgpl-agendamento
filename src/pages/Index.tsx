import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Sistema = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CGPL Soluções</h1>
                <p className="text-sm text-gray-500">Sistema de Agendamento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.role === 'planner' && '(Planejador)'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'client' ? 'Cliente' : 'Administrador'}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Bem-vindo ao Sistema CGPL Soluções, {user?.firstName}!
            </h2>
            <p className="text-gray-600 mb-6">
              {user?.role === 'planner' 
                ? 'Painel do Planejador - Gerencie todos os agendamentos' 
                : 'Área do Cliente - Acompanhe seus agendamentos'
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-semibold text-blue-800 mb-2">Agendamentos</h3>
                <p className="text-blue-600 text-sm">
                  {user?.role === 'planner' ? 'Ver todos os agendamentos' : 'Meus agendamentos'}
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-green-800 mb-2">
                  {user?.role === 'planner' ? 'Clientes' : 'Perfil'}
                </h3>
                <p className="text-green-600 text-sm">
                  {user?.role === 'planner' ? 'Gerenciar clientes' : 'Meus dados'}
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-purple-800 mb-2">Relatórios</h3>
                <p className="text-purple-600 text-sm">
                  {user?.role === 'planner' ? 'Relatórios completos' : 'Meus históricos'}
                </p>
              </div>
            </div>

            {/* Informações de demo */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Demo:</strong> Sistema funcionando com autenticação
                {user?.role === 'planner' && ' (Modo Planejador - senha: 123456)'}
                {user?.role === 'client' && ' (Modo Cliente)'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sistema;
