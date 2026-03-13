import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { login, loginBiometria, verificarLogado, temUsuario } from '../auth';
import * as LocalAuthentication from 'expo-local-authentication';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [temBiometria, setTemBiometria] = useState(false);

  useEffect(() => { verificarAcesso(); }, []);

  const verificarAcesso = async () => {
    const logado = await verificarLogado();
    const bio = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setTemBiometria(bio && enrolled);
    if (logado && bio && enrolled) tentarBiometria();
  };

  const tentarBiometria = async () => {
    const resultado = await loginBiometria();
    if (resultado.sucesso) navigation.replace('Main');
  };

  const handleLogin = async () => {
    if (!email || !senha) return Alert.alert('Atenção', 'Preencha e-mail e senha!');
    setLoading(true);
    const resultado = await login(email, senha);
    setLoading(false);
    if (!resultado.sucesso) return Alert.alert('Erro', resultado.erro);
    navigation.replace('Main');
  };

  const handleBiometria = async () => {
    const usuario = await temUsuario();
    if (!usuario) return Alert.alert('Atenção', 'Faça login com senha primeiro para ativar a biometria!');
    const resultado = await loginBiometria();
    if (resultado.sucesso) navigation.replace('Main');
    else Alert.alert('Erro', resultado.erro);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.emoji}>💰</Text>
          <Text style={styles.titulo}>FinançasPro</Text>
          <Text style={styles.subtitulo}>Suas finanças seguras</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.senhaWrap}>
            <TextInput
              style={styles.senhaInput}
              placeholder="Sua senha"
              placeholderTextColor="#64748b"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeBtn}>
              <Text style={styles.eyeTxt}>{mostrarSenha ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnLoginTxt}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>

          {temBiometria && (
            <TouchableOpacity style={styles.btnBio} onPress={handleBiometria}>
              <Text style={styles.btnBioTxt}>🔐 Entrar com biometria</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnCadastro} onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.btnCadastroTxt}>Não tenho conta — <Text style={{ color: '#00d4ff' }}>Cadastrar</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 12 },
  titulo: { fontSize: 32, fontWeight: '800', color: '#00d4ff', letterSpacing: -1 },
  subtitulo: { fontSize: 16, color: '#64748b', marginTop: 4 },
  form: { backgroundColor: '#131e30', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1f3050' },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: '#1a2840', borderWidth: 1, borderColor: '#1f3050', borderRadius: 14, padding: 14, fontSize: 16, color: '#e8eef8', marginBottom: 16 },
  senhaWrap: { flexDirection: 'row', backgroundColor: '#1a2840', borderWidth: 1, borderColor: '#1f3050', borderRadius: 14, marginBottom: 16, alignItems: 'center' },
  senhaInput: { flex: 1, padding: 14, fontSize: 16, color: '#e8eef8' },
  eyeBtn: { padding: 14 },
  eyeTxt: { fontSize: 18 },
  btnLogin: { backgroundColor: '#00d4ff', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnLoginTxt: { color: '#0b1120', fontSize: 16, fontWeight: '800' },
  btnBio: { backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)' },
  btnBioTxt: { color: '#00d4ff', fontSize: 15, fontWeight: '600' },
  btnCadastro: { alignItems: 'center', padding: 8 },
  btnCadastroTxt: { color: '#64748b', fontSize: 14 },
});