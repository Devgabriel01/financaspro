import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { getUsuario, logout, deletarConta } from '../auth';

export default function Perfil({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [foto, setFoto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  useEffect(() => { carregarPerfil(); }, []);

  const carregarPerfil = async () => {
    const u = await getUsuario();
    if (u) {
      setUsuario(u);
      setNome(u.nome);
      setEmail(u.email);
    }
    const fotoSalva = await SecureStore.getItemAsync('foto_perfil');
    if (fotoSalva) setFoto(fotoSalva);
  };

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return Alert.alert('Atenção', 'Permissão de galeria necessária!');
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!resultado.canceled) {
      const uri = resultado.assets[0].uri;
      setFoto(uri);
      await SecureStore.setItemAsync('foto_perfil', uri);
    }
  };

  const salvarPerfil = async () => {
    if (!nome || !email) return Alert.alert('Atenção', 'Preencha nome e e-mail!');
    if (!email.includes('@')) return Alert.alert('Atenção', 'E-mail inválido!');
    const u = { ...usuario, nome, email };
    await SecureStore.setItemAsync('usuario', JSON.stringify(u));
    setUsuario(u);
    setEditando(false);
    Alert.alert('Sucesso', 'Perfil atualizado!');
  };

  const salvarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha)
      return Alert.alert('Atenção', 'Preencha todos os campos!');
    if (senhaAtual !== usuario.senha)
      return Alert.alert('Erro', 'Senha atual incorreta!');
    if (novaSenha.length < 6)
      return Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres!');
    if (novaSenha !== confirmarSenha)
      return Alert.alert('Atenção', 'As senhas não coincidem!');
    const u = { ...usuario, senha: novaSenha };
    await SecureStore.setItemAsync('usuario', JSON.stringify(u));
    setUsuario(u);
    setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    setTrocandoSenha(false);
    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await logout();
        navigation.replace('Login');
      }},
    ]);
  };

  const handleDeletar = () => {
    Alert.alert('Deletar conta', 'Todos os seus dados serão apagados permanentemente. Tem certeza?', [
      { text: 'Cancelar' },
      { text: 'Deletar', style: 'destructive', onPress: async () => {
        await deletarConta();
        navigation.replace('Login');
      }},
    ]);
  };

  const iniciais = nome ? nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.titulo}>Meu Perfil</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Configuracoes')}
            style={{ backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)' }}>
            <Text style={{ color: '#00d4ff', fontSize: 13, fontWeight: '600' }}>⚙️ Config</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Foto */}
      <View style={styles.fotoSection}>
        <TouchableOpacity onPress={escolherFoto} style={styles.fotoWrap}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.foto} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.iniciais}>{iniciais}</Text>
            </View>
          )}
          <View style={styles.fotoEdit}>
            <Text style={{ fontSize: 16 }}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.nomeExibido}>{nome}</Text>
        <Text style={styles.emailExibido}>{email}</Text>
      </View>

      {/* Editar perfil */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setEditando(!editando)}>
          <Text style={styles.sectionTitulo}>✏️ Editar nome e e-mail</Text>
          <Text style={styles.sectionArrow}>{editando ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {editando && (
          <View style={styles.sectionBody}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#64748b" autoCapitalize="words" />
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholderTextColor="#64748b" keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarPerfil}>
              <Text style={styles.btnSalvarTxt}>Salvar alterações</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Trocar senha */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setTrocandoSenha(!trocandoSenha)}>
          <Text style={styles.sectionTitulo}>🔑 Trocar senha</Text>
          <Text style={styles.sectionArrow}>{trocandoSenha ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {trocandoSenha && (
          <View style={styles.sectionBody}>
            <Text style={styles.label}>Senha atual</Text>
            <TextInput style={styles.input} value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry placeholderTextColor="#64748b" placeholder="Digite a senha atual" />
            <Text style={styles.label}>Nova senha</Text>
            <TextInput style={styles.input} value={novaSenha} onChangeText={setNovaSenha} secureTextEntry placeholderTextColor="#64748b" placeholder="Mínimo 6 caracteres" />
            <Text style={styles.label}>Confirmar nova senha</Text>
            <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry placeholderTextColor="#64748b" placeholder="Repita a nova senha" />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarSenha}>
              <Text style={styles.btnSalvarTxt}>Alterar senha</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnLogoutTxt}>🚪 Sair da conta</Text>
      </TouchableOpacity>

      {/* Deletar conta */}
      <TouchableOpacity style={styles.btnDeletar} onPress={handleDeletar}>
        <Text style={styles.btnDeletarTxt}>🗑️ Deletar minha conta</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: '#0f1e38' },
  backBtn: { marginBottom: 8 },
  backTxt: { color: '#00d4ff', fontSize: 14 },
  titulo: { fontSize: 28, fontWeight: '800', color: '#e8eef8' },
  fotoSection: { alignItems: 'center', padding: 32, backgroundColor: '#0f1e38' },
  fotoWrap: { position: 'relative', marginBottom: 16 },
  foto: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#00d4ff' },
  fotoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a2840', borderWidth: 3, borderColor: '#00d4ff', alignItems: 'center', justifyContent: 'center' },
  iniciais: { fontSize: 36, fontWeight: '800', color: '#00d4ff' },
  fotoEdit: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00d4ff', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  nomeExibido: { fontSize: 22, fontWeight: '700', color: '#e8eef8', marginBottom: 4 },
  emailExibido: { fontSize: 14, color: '#64748b' },
  section: { margin: 16, backgroundColor: '#131e30', borderRadius: 16, borderWidth: 1, borderColor: '#1f3050', overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  sectionTitulo: { fontSize: 15, fontWeight: '600', color: '#e8eef8' },
  sectionArrow: { color: '#64748b', fontSize: 12 },
  sectionBody: { padding: 16, paddingTop: 0 },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: '#1a2840', borderWidth: 1, borderColor: '#1f3050', borderRadius: 14, padding: 14, fontSize: 16, color: '#e8eef8', marginBottom: 16 },
  btnSalvar: { backgroundColor: '#00d4ff', borderRadius: 14, padding: 14, alignItems: 'center' },
  btnSalvarTxt: { color: '#0b1120', fontSize: 15, fontWeight: '700' },
  btnLogout: { margin: 16, marginBottom: 8, backgroundColor: '#1a2840', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1f3050' },
  btnLogoutTxt: { color: '#e8eef8', fontSize: 15, fontWeight: '600' },
  btnDeletar: { margin: 16, marginTop: 8, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244,63,94,0.3)' },
  btnDeletarTxt: { color: '#f43f5e', fontSize: 15, fontWeight: '600' },
});