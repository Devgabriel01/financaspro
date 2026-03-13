import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { cadastrar } from '../auth';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmar)
      return Alert.alert('Atenção', 'Preencha todos os campos!');
    if (senha.length < 6)
      return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres!');
    if (senha !== confirmar)
      return Alert.alert('Atenção', 'As senhas não coincidem!');
    if (!email.includes('@'))
      return Alert.alert('Atenção', 'E-mail inválido!');

    setLoading(true);
    await cadastrar(nome, email, senha);
    setLoading(false);
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.emoji}>💰</Text>
          <Text style={styles.titulo}>FinançasPro</Text>
          <Text style={styles.subtitulo}>Crie sua conta</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Seu nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: João Silva"
            placeholderTextColor="#64748b"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

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
              placeholder="Mínimo 6 caracteres"
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

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#64748b"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.btnCadastro} onPress={handleCadastro} disabled={loading}>
            <Text style={styles.btnCadastroTxt}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLogin} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnLoginTxt}>Já tenho conta — <Text style={{ color: '#00d4ff' }}>Entrar</Text></Text>
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
  btnCadastro: { backgroundColor: '#00d4ff', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  btnCadastroTxt: { color: '#0b1120', fontSize: 16, fontWeight: '800' },
  btnLogin: { alignItems: 'center', padding: 8 },
  btnLoginTxt: { color: '#64748b', fontSize: 14 },
});