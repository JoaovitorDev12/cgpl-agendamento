import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert('Preencha todos os campos!');
      return;
    }

    const success = await register(formData);
    if (success) {
      alert('Cadastro realizado! Faça login.');
    } else {
      alert('Erro no cadastro.');
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome *"
          className="px-3 py-2 border rounded-md"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Sobrenome *"
          className="px-3 py-2 border rounded-md"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
        />
      </div>
      
      <input
        type="email"
        placeholder="Email *"
        className="w-full px-3 py-2 border rounded-md"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      />
      
      <input
        type="password"
        placeholder="Senha *"
        className="w-full px-3 py-2 border rounded-md"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
      />
      
      <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md">
        Cadastrar
      </button>
    </form>
  );
};

export default RegisterForm;