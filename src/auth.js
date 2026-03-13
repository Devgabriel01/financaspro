import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Salvar usuário com senha criptografada
export const cadastrar = async (nome, email, senha) => {
  const usuario = { nome, email, senha };
  await SecureStore.setItemAsync('usuario', JSON.stringify(usuario));
  await SecureStore.setItemAsync('logado', 'true');
};

// Verificar login
export const login = async (email, senha) => {
  const raw = await SecureStore.getItemAsync('usuario');
  if (!raw) return { sucesso: false, erro: 'Usuário não encontrado!' };
  const usuario = JSON.parse(raw);
  if (usuario.email !== email) return { sucesso: false, erro: 'E-mail incorreto!' };
  if (usuario.senha !== senha) return { sucesso: false, erro: 'Senha incorreta!' };
  await SecureStore.setItemAsync('logado', 'true');
  return { sucesso: true, usuario };
};

// Login com biometria
export const loginBiometria = async () => {
  const compativel = await LocalAuthentication.hasHardwareAsync();
  if (!compativel) return { sucesso: false, erro: 'Biometria não disponível neste dispositivo' };

  const cadastrada = await LocalAuthentication.isEnrolledAsync();
  if (!cadastrada) return { sucesso: false, erro: 'Nenhuma biometria cadastrada no dispositivo' };

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Entrar no FinançasPro',
    fallbackLabel: 'Usar senha',
    cancelLabel: 'Cancelar',
  });

  if (!resultado.success) return { sucesso: false, erro: 'Biometria não reconhecida' };

  const logado = await SecureStore.getItemAsync('logado');
  if (logado !== 'true') return { sucesso: false, erro: 'Faça login com senha primeiro' };

  return { sucesso: true };
};

// Verificar se já está logado
export const verificarLogado = async () => {
  const logado = await SecureStore.getItemAsync('logado');
  return logado === 'true';
};

// Verificar se tem usuário cadastrado
export const temUsuario = async () => {
  const raw = await SecureStore.getItemAsync('usuario');
  return !!raw;
};

// Buscar dados do usuário
export const getUsuario = async () => {
  const raw = await SecureStore.getItemAsync('usuario');
  return raw ? JSON.parse(raw) : null;
};

// Logout
export const logout = async () => {
  await SecureStore.setItemAsync('logado', 'false');
};

// Deletar conta
export const deletarConta = async () => {
  await SecureStore.deleteItemAsync('usuario');
  await SecureStore.deleteItemAsync('logado');
};