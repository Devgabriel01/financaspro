import AsyncStorage from '@react-native-async-storage/async-storage';

export const salvar = async (chave, dados) => {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(dados));
  } catch (e) {
    console.log('Erro ao salvar:', e);
  }
};

export const carregar = async (chave) => {
  try {
    const raw = await AsyncStorage.getItem(chave);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log('Erro ao carregar:', e);
    return [];
  }
};

export const deletar = async (chave) => {
  try {
    await AsyncStorage.removeItem(chave);
  } catch (e) {
    console.log('Erro ao deletar:', e);
  }
};