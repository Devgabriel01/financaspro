import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useTema } from '../theme';
import { agendarLembrete, cancelarLembrete, getLembretes, pedirPermissao } from '../notificacoes';
import { exportarPDF, exportarCSV } from '../exportar';
import { getUsuario } from '../auth';

export default function Configuracoes({ navigation }) {
  const { modo, tema, alternarTema } = useTema();
  const [lembretes, setLembretes] = useState([]);
  const [modalLembrete, setModalLembrete] = useState(false);
  const [tituloLembrete, setTituloLembrete] = useState('');
  const [horaLembrete, setHoraLembrete] = useState('08');
  const [minutoLembrete, setMinutoLembrete] = useState('00');
  const [exportando, setExportando] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    const l = await getLembretes();
    setLembretes(l);
    const u = await getUsuario();
    setUsuario(u);
  };

  const adicionarLembrete = async () => {
    if (!tituloLembrete) return Alert.alert('Atenção', 'Digite um título!');
    const hora = parseInt(horaLembrete);
    const minuto = parseInt(minutoLembrete);
    if (hora < 0 || hora > 23) return Alert.alert('Atenção', 'Hora inválida! (0-23)');
    if (minuto < 0 || minuto > 59) return Alert.alert('Atenção', 'Minuto inválido! (0-59)');
    const permissao = await pedirPermissao();
    if (!permissao) return Alert.alert('Erro', 'Permissão de notificação negada!');
    await agendarLembrete(
      '💰 ' + tituloLembrete,
      'Não esqueça de registrar suas finanças no FinançasPro!',
      hora,
      minuto
    );
    setModalLembrete(false);
    setTituloLembrete('');
    setHoraLembrete('08');
    setMinutoLembrete('00');
    await carregarDados();
    Alert.alert('Sucesso', `Lembrete agendado para ${horaLembrete}:${minutoLembrete} todos os dias!`);
  };

  const removerLembrete = async (id) => {
    Alert.alert('Remover', 'Remover este lembrete?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        await cancelarLembrete(id);
        await carregarDados();
      }},
    ]);
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(usuario);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível exportar o PDF!');
    }
    setExportando(false);
  };

  const handleExportarCSV = async () => {
    setExportando(true);
    try {
      await exportarCSV(usuario);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível exportar o CSV!');
    }
    setExportando(false);
  };

  const s = makeStyles(tema);

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>Configurações</Text>
      </View>

      {/* Aparência */}
      <View style={s.section}>
        <Text style={s.sectionTitulo}>🎨 Aparência</Text>
        <View style={s.row}>
          <View>
            <Text style={s.rowTitulo}>Modo {modo === 'escuro' ? 'Escuro' : 'Claro'}</Text>
            <Text style={s.rowSub}>{modo === 'escuro' ? '🌙 Tema escuro ativo' : '☀️ Tema claro ativo'}</Text>
          </View>
          <Switch
            value={modo === 'claro'}
            onValueChange={alternarTema}
            trackColor={{ false: '#1f3050', true: '#00d4ff' }}
            thumbColor={modo === 'claro' ? '#fff' : '#64748b'}
          />
        </View>
      </View>

      {/* Notificações */}
      <View style={s.section}>
        <Text style={s.sectionTitulo}>🔔 Lembretes</Text>
        {lembretes.length === 0 ? (
          <Text style={s.empty}>Nenhum lembrete agendado</Text>
        ) : (
          lembretes.map(l => (
            <TouchableOpacity key={l.id} style={s.lembreteItem} onLongPress={() => removerLembrete(l.id)}>
              <View>
                <Text style={s.lembreteTitulo}>{l.titulo}</Text>
                <Text style={s.lembreteSub}>Todos os dias às {String(l.hora).padStart(2,'0')}:{String(l.minuto).padStart(2,'0')}</Text>
              </View>
              <TouchableOpacity onPress={() => removerLembrete(l.id)}>
                <Text style={{ color: '#f43f5e', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity style={s.btnAdicionar} onPress={() => setModalLembrete(true)}>
          <Text style={s.btnAdicionarTxt}>+ Novo lembrete</Text>
        </TouchableOpacity>
      </View>

      {/* Exportar */}
      <View style={s.section}>
        <Text style={s.sectionTitulo}>📤 Exportar dados</Text>
        <Text style={s.rowSub} >Exporte todas as suas transações em PDF ou CSV</Text>
        <TouchableOpacity style={s.btnExportar} onPress={handleExportarPDF} disabled={exportando}>
          <Text style={s.btnExportarTxt}>{exportando ? 'Gerando...' : '📄 Exportar PDF'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnExportar, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' }]} onPress={handleExportarCSV} disabled={exportando}>
          <Text style={[s.btnExportarTxt, { color: '#10b981' }]}>{exportando ? 'Gerando...' : '📊 Exportar CSV'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sobre */}
      <View style={s.section}>
        <Text style={s.sectionTitulo}>ℹ️ Sobre</Text>
        <View style={s.row}>
          <Text style={s.rowTitulo}>Versão</Text>
          <Text style={s.rowSub}>1.0.0</Text>
        </View>
        <View style={s.row}>
          <Text style={s.rowTitulo}>Desenvolvido por</Text>
          <Text style={s.rowSub}>FinançasPro Team</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Modal lembrete */}
      <Modal visible={modalLembrete} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitulo}>Novo Lembrete</Text>
            <Text style={s.label}>Título</Text>
            <TextInput style={s.input} placeholder="Ex: Registrar gastos do dia..." placeholderTextColor="#64748b" value={tituloLembrete} onChangeText={setTituloLembrete} />
            <Text style={s.label}>Horário</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <TextInput style={s.input} placeholder="08" placeholderTextColor="#64748b" keyboardType="numeric" maxLength={2} value={horaLembrete} onChangeText={setHoraLembrete} />
              </View>
              <View style={{ justifyContent: 'center', paddingBottom: 16 }}>
                <Text style={{ color: s.input.color || '#e8eef8', fontSize: 24, fontWeight: '700' }}>:</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={s.input} placeholder="00" placeholderTextColor="#64748b" keyboardType="numeric" maxLength={2} value={minutoLembrete} onChangeText={setMinutoLembrete} />
              </View>
            </View>
            <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 16 }}>⏰ O lembrete será enviado todos os dias neste horário</Text>
            <View style={s.sheetActions}>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalLembrete(false)}>
                <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSave} onPress={adicionarLembrete}>
                <Text style={{ color: '#0b1120', fontSize: 15, fontWeight: '700' }}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.bg },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: tema.bg2 },
  backBtn: { marginBottom: 8 },
  backTxt: { color: tema.primario, fontSize: 14 },
  titulo: { fontSize: 28, fontWeight: '800', color: tema.texto },
  section: { margin: 16, backgroundColor: tema.bg3, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: tema.border },
  sectionTitulo: { fontSize: 15, fontWeight: '700', color: tema.texto, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowTitulo: { fontSize: 14, fontWeight: '500', color: tema.texto },
  rowSub: { fontSize: 12, color: tema.textoSec, marginTop: 2 },
  empty: { color: tema.textoSec, fontSize: 13, marginBottom: 12 },
  lembreteItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tema.bg4, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: tema.border },
  lembreteTitulo: { fontSize: 14, fontWeight: '500', color: tema.texto },
  lembreteSub: { fontSize: 12, color: tema.textoSec, marginTop: 2 },
  btnAdicionar: { backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)', marginTop: 8 },
  btnAdicionarTxt: { color: tema.primario, fontSize: 14, fontWeight: '600' },
  btnExportar: { backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)', marginTop: 12 },
  btnExportarTxt: { color: tema.primario, fontSize: 15, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: tema.bg3, borderRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: tema.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitulo: { fontSize: 20, fontWeight: '700', color: tema.texto, marginBottom: 20 },
  label: { fontSize: 11, color: tema.textoSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: tema.bg4, borderWidth: 1, borderColor: tema.border, borderRadius: 14, padding: 14, fontSize: 16, color: tema.texto, marginBottom: 16 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: tema.bg4, alignItems: 'center', borderWidth: 1, borderColor: tema.border },
  btnSave: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: tema.primario, alignItems: 'center' },
});