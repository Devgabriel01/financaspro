import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const ThemeContext = createContext();

export const temas = {
  escuro: {
    bg: '#0b1120',
    bg2: '#0f1e38',
    bg3: '#131e30',
    bg4: '#1a2840',
    border: '#1f3050',
    texto: '#e8eef8',
    textoSec: '#64748b',
    primario: '#00d4ff',
  },
  claro: {
    bg: '#f1f5f9',
    bg2: '#ffffff',
    bg3: '#ffffff',
    bg4: '#f8fafc',
    border: '#e2e8f0',
    texto: '#0f172a',
    textoSec: '#94a3b8',
    primario: '#0284c7',
  },
};

export function ThemeProvider({ children }) {
  const [modo, setModo] = useState('escuro');

  useEffect(() => { carregarTema(); }, []);

  const carregarTema = async () => {
    const salvo = await SecureStore.getItemAsync('tema');
    if (salvo) setModo(salvo);
  };

  const alternarTema = async () => {
    const novo = modo === 'escuro' ? 'claro' : 'escuro';
    setModo(novo);
    await SecureStore.setItemAsync('tema', novo);
  };

  return (
    <ThemeContext.Provider value={{ modo, tema: temas[modo], alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTema = () => useContext(ThemeContext);