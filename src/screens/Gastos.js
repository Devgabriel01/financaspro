import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { salvar, carregar } from '../storage';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [modal, setModal] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Alimentação');
  const [tipo, setTipo] = useState('variavel');

  const categorias = ['Moradia','Alimentação','Transporte','Saúde','Educação','Lazer','Vestuário','Assinaturas','Pets','Outros'];
  const catIcons = {'Moradia':'🏠','Alimentação':'🍽️','Transporte':'🚗','Saúde':'💊','Educação':'📚','Lazer':'🎮','Vestuário':'👕','Assinaturas':'📱','Pets':'🐾','Outros':'📦'};

  useEffect(() => { carregarGastos(); }, []);

  const carregarGastos = async () => {
    const dados = await carregar('gastos');
    setGastos(dados);
  };

  const adicionar = async () => {
    if (!descricao || !valor) return Alert.alert('Atenção', 'Preencha descrição e valor!');
    const novo = {
      id: Date.now().toString(),
      descricao,
      valor: parseFloat(valor),
      categoria,
      tipo,
      data: new Date().toLocaleDateString('pt-BR'),
    };
    const novos = [...gastos, novo];
    setGastos(novos);
    await salvar('gastos', novos);
    setModal(false);
    setDescricao('');
    setValor('');
  };

  const deletar = async (id) => {
    Alert.alert('Remover', 'Deseja remover este gasto?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const novos = gastos.filter(g => g.id !== id);
        setGastos(novos);
        await salvar('gastos', novos);
      }},
    ]);
  };

  const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const total = gastos.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const fixos = gastos.filter(x => x.tipo === 'fixo').reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const vars = gastos.filter(x => x.tipo !== 'fixo').reduce((a, x) => a + parseFloat(x.valor||0), 0);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Meus</Text>
          <Text style={styles.title}>Gastos</Text>
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Total</Text>
              <Text style={[styles.chipVal, { color: '#f43f5e' }]}>{fmt(total)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Fixos</Text>
              <Text style={[styles.chipVal, { color: '#f43f5e' }]}>{fmt(fixos)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Variáveis</Text>
              <Text style={[styles.chipVal, { color: '#f43f5e' }]}>{fmt(vars)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos os gastos</Text>
          {gastos.length === 0 ? (
            <Text style={styles.empty}>🧾 Nenhum gasto ainda</Text>
          ) : (
            [...gastos].reverse().map(g => (
              <TouchableOpacity key={g.id} style={styles.item} onLongPress={() => deletar(g.id)}>
                <View style={styles.itemIcon}>
                  <Text style={{ fontSize: 22 }}>{catIcons[g.categoria] || '📦'}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemDesc}>{g.descricao}</Text>
                  <Text style={styles.itemCat}>{g.categoria} · {g.tipo === 'fixo' ? 'Fixo' : 'Variável'} · {g.data}</Text>
                </View>
                <Text style={styles.itemVal}>-{fmt(g.valor)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
        <Text style={styles.fabText}>+ Novo Gasto</Text>
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Novo Gasto</Text>

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={styles.input} placeholder="Ex: Aluguel, iFood..." placeholderTextColor="#64748b" value={descricao} onChangeText={setDescricao} />

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />

            <Text style={styles.label}>Tipo</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setTipo('fixo')}
                style={[styles.catBtn, tipo === 'fixo' && { backgroundColor: '#00d4ff', borderColor: '#00d4ff' }]}>
                <Text style={[styles.catBtnText, tipo === 'fixo' && { color: '#fff' }]}>🔒 Fixo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTipo('variavel')}
                style={[styles.catBtn, tipo === 'variavel' && { backgroundColor: '#7c3aed', borderColor: '#7c3aed' }]}>
                <Text style={[styles.catBtnText, tipo === 'variavel' && { color: '#fff' }]}>🔄 Variável</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {categorias.map(c => (
                <TouchableOpacity key={c} onPress={() => setCategoria(c)}
                  style={[styles.catBtn, categoria === c && { backgroundColor: '#f43f5e', borderColor: '#f43f5e' }]}>
                  <Text style={[styles.catBtnText, categoria === c && { color: '#fff' }]}>{catIcons[c]} {c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}>
                <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={adicionar}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#220a12' },
  subtitle: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#f43f5e', marginBottom: 16 },
  chips: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)' },
  chipLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  chipVal: { fontSize: 14, fontWeight: '600' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e8eef8', marginBottom: 12 },
  empty: { color: '#64748b', textAlign: 'center', padding: 32, fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131e30', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f3050' },
  itemIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(244,63,94,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemInfo: { flex: 1 },
  itemDesc: { fontSize: 14, fontWeight: '500', color: '#e8eef8' },
  itemCat: { fontSize: 11, color: '#64748b', marginTop: 2 },
  itemVal: { fontSize: 15, fontWeight: '600', color: '#f43f5e' },
  fab: { margin: 16, backgroundColor: '#f43f5e', borderRadius: 14, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#131e30', borderRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: '#1f3050', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#e8eef8', marginBottom: 20 },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: '#1a2840', borderWidth: 1, borderColor: '#1f3050', borderRadius: 14, padding: 14, fontSize: 16, color: '#e8eef8', marginBottom: 16 },
  catBtn: { backgroundColor: '#1a2840', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#1f3050' },
  catBtnText: { color: '#64748b', fontSize: 13 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#1a2840', alignItems: 'center', borderWidth: 1, borderColor: '#1f3050' },
  btnSave: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: '#f43f5e', alignItems: 'center' },
});