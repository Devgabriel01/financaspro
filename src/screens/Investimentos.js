import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { salvar, carregar } from '../storage';

export default function Investimentos() {
  const [investimentos, setInvestimentos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [modalInv, setModalInv] = useState(false);
  const [modalMeta, setModalMeta] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [retorno, setRetorno] = useState('');
  const [tipo, setTipo] = useState('Renda Fixa');
  const [nomeMeta, setNomeMeta] = useState('');
  const [totalMeta, setTotalMeta] = useState('');
  const [atualMeta, setAtualMeta] = useState('');

  const tipos = ['Renda Fixa','Tesouro Direto','CDB/LCI','Ações','FIIs','Cripto','Poupança','Previdência','Outros'];
  const tiposIcons = {'Renda Fixa':'📋','Tesouro Direto':'🇧🇷','CDB/LCI':'🏦','Ações':'📊','FIIs':'🏢','Cripto':'🪙','Poupança':'🐷','Previdência':'👴','Outros':'💼'};

  useFocusEffect(
    useCallback(() => { carregarDados(); }, [])
  );

  const carregarDados = async () => {
    setInvestimentos(await carregar('investimentos'));
    setMetas(await carregar('metas'));
  };

  const adicionarInv = async () => {
    if (!nome || !valor) return Alert.alert('Atenção', 'Preencha nome e valor!');
    const novo = { id: Date.now().toString(), nome, valor: parseFloat(valor), retorno: parseFloat(retorno||0), tipo };
    const novos = [...investimentos, novo];
    setInvestimentos(novos);
    await salvar('investimentos', novos);
    setModalInv(false);
    setNome(''); setValor(''); setRetorno('');
  };

  const adicionarMeta = async () => {
    if (!nomeMeta || !totalMeta) return Alert.alert('Atenção', 'Preencha nome e valor!');
    const nova = { id: Date.now().toString(), nome: nomeMeta, total: parseFloat(totalMeta), atual: parseFloat(atualMeta||0) };
    const novas = [...metas, nova];
    setMetas(novas);
    await salvar('metas', novas);
    setModalMeta(false);
    setNomeMeta(''); setTotalMeta(''); setAtualMeta('');
  };

  const deletarInv = async (id) => {
    Alert.alert('Remover', 'Remover este investimento?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const novos = investimentos.filter(x => x.id !== id);
        setInvestimentos(novos);
        await salvar('investimentos', novos);
      }},
    ]);
  };

  const deletarMeta = async (id) => {
    Alert.alert('Remover', 'Remover esta meta?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const novas = metas.filter(x => x.id !== id);
        setMetas(novas);
        await salvar('metas', novas);
      }},
    ]);
  };

  const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const total = investimentos.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const ret = investimentos.reduce((a, x) => a + parseFloat(x.valor||0) * parseFloat(x.retorno||0) / 100, 0);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Meus</Text>
          <Text style={styles.title}>Investimentos</Text>
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Patrimônio</Text>
              <Text style={[styles.chipVal, { color: '#00d4ff' }]}>{fmt(total)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Retorno/Ano</Text>
              <Text style={[styles.chipVal, { color: '#10b981' }]}>{fmt(ret)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas</Text>
            <TouchableOpacity onPress={() => setModalMeta(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Nova</Text>
            </TouchableOpacity>
          </View>
          {metas.length === 0 ? (
            <Text style={styles.empty}>🎯 Nenhuma meta ainda</Text>
          ) : (
            metas.map(m => {
              const pct = Math.min(100, parseFloat(m.atual||0) / parseFloat(m.total||1) * 100);
              const cor = pct >= 100 ? '#10b981' : pct >= 50 ? '#00d4ff' : '#f59e0b';
              return (
                <TouchableOpacity key={m.id} style={styles.metaCard} onLongPress={() => deletarMeta(m.id)}>
                  <View style={styles.metaTop}>
                    <Text style={styles.metaNome}>{m.nome}</Text>
                    <Text style={[styles.metaPct, { color: cor }]}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.metaVals}>
                    <Text style={styles.metaVal}>{fmt(m.atual)} guardados</Text>
                    <Text style={styles.metaVal}>{fmt(m.total)} objetivo</Text>
                  </View>
                  <View style={styles.pb}>
                    <View style={[styles.pbFill, { width: `${pct}%`, backgroundColor: cor }]} />
                  </View>
                  {pct >= 100 && <Text style={{ color: '#10b981', fontSize: 12, marginTop: 8, fontWeight: '600' }}>Meta atingida! 🎉</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ativos</Text>
            <TouchableOpacity onPress={() => setModalInv(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Novo</Text>
            </TouchableOpacity>
          </View>
          {investimentos.length === 0 ? (
            <Text style={styles.empty}>📈 Nenhum investimento ainda</Text>
          ) : (
            investimentos.map(x => (
              <TouchableOpacity key={x.id} style={styles.invItem} onLongPress={() => deletarInv(x.id)}>
                <View style={styles.invIcon}>
                  <Text style={{ fontSize: 22 }}>{tiposIcons[x.tipo] || '💰'}</Text>
                </View>
                <View style={styles.invInfo}>
                  <Text style={styles.invNome}>{x.nome}</Text>
                  <Text style={styles.invTipo}>{x.tipo}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invVal}>{fmt(x.valor)}</Text>
                  <Text style={[styles.invRet, { color: parseFloat(x.retorno||0) >= 0 ? '#10b981' : '#f43f5e' }]}>
                    {parseFloat(x.retorno||0) >= 0 ? '+' : ''}{x.retorno}% a.a.
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Investimento */}
      <Modal visible={modalInv} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Novo Investimento</Text>
            <Text style={styles.label}>Nome do Ativo</Text>
            <TextInput style={styles.input} placeholder="Ex: PETR4, Tesouro Selic..." placeholderTextColor="#64748b" value={nome} onChangeText={setNome} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Valor (R$)</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Retorno % a.a.</Text>
                <TextInput style={styles.input} placeholder="12.5" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={retorno} onChangeText={setRetorno} />
              </View>
            </View>
            <Text style={styles.label}>Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {tipos.map(t => (
                <TouchableOpacity key={t} onPress={() => setTipo(t)}
                  style={[styles.catBtn, tipo === t && { backgroundColor: '#00d4ff', borderColor: '#00d4ff' }]}>
                  <Text style={[styles.catBtnText, tipo === t && { color: '#0b1120' }]}>{tiposIcons[t]} {t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalInv(false)}>
                <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: '#00d4ff' }]} onPress={adicionarInv}>
                <Text style={{ color: '#0b1120', fontSize: 15, fontWeight: '700' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Meta */}
      <Modal visible={modalMeta} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Nova Meta</Text>
            <Text style={styles.label}>Nome da Meta</Text>
            <TextInput style={styles.input} placeholder="Ex: Viagem, Carro, Reserva..." placeholderTextColor="#64748b" value={nomeMeta} onChangeText={setNomeMeta} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Objetivo (R$)</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={totalMeta} onChangeText={setTotalMeta} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Já guardei (R$)</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={atualMeta} onChangeText={setAtualMeta} />
              </View>
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalMeta(false)}>
                <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: '#f59e0b' }]} onPress={adicionarMeta}>
                <Text style={{ color: '#0b1120', fontSize: 15, fontWeight: '700' }}>Salvar</Text>
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
  header: { padding: 24, paddingTop: 60, backgroundColor: '#081828' },
  subtitle: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#00d4ff', marginBottom: 16 },
  chips: { flexDirection: 'row', gap: 12 },
  chip: { flex: 1, backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)' },
  chipLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  chipVal: { fontSize: 16, fontWeight: '600' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e8eef8' },
  addBtn: { backgroundColor: 'rgba(0,212,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)' },
  addBtnText: { color: '#00d4ff', fontSize: 13, fontWeight: '600' },
  empty: { color: '#64748b', textAlign: 'center', padding: 32, fontSize: 14 },
  metaCard: { backgroundColor: '#131e30', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1f3050' },
  metaTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaNome: { fontSize: 15, fontWeight: '600', color: '#e8eef8' },
  metaPct: { fontSize: 15, fontWeight: '700' },
  metaVals: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaVal: { fontSize: 12, color: '#64748b' },
  pb: { height: 8, backgroundColor: '#1a2840', borderRadius: 4, overflow: 'hidden' },
  pbFill: { height: '100%', borderRadius: 4 },
  invItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131e30', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f3050' },
  invIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,212,255,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  invInfo: { flex: 1 },
  invNome: { fontSize: 14, fontWeight: '600', color: '#e8eef8' },
  invTipo: { fontSize: 11, color: '#64748b', marginTop: 2 },
  invVal: { fontSize: 15, fontWeight: '700', color: '#00d4ff' },
  invRet: { fontSize: 12, marginTop: 2 },
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
  btnSave: { flex: 2, padding: 14, borderRadius: 14, alignItems: 'center' },
});