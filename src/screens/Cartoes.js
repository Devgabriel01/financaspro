import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { salvar, carregar } from '../storage';

export default function Cartoes() {
  const [cartoes, setCartoes] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [modalCartao, setModalCartao] = useState(false);
  const [modalLanc, setModalLanc] = useState(false);
  const [nome, setNome] = useState('');
  const [final, setFinal] = useState('');
  const [limite, setLimite] = useState('');
  const [bandeira, setBandeira] = useState('Visa');
  const [descLanc, setDescLanc] = useState('');
  const [valorLanc, setValorLanc] = useState('');
  const [cartaoSel, setCartaoSel] = useState('');
  const [parcelas, setParcelas] = useState('1');

  const bandeiras = ['Visa','Mastercard','Elo','American Express','Hipercard'];
  const gradients = ['#0ea5e9','#10b981','#f59e0b','#8b5cf6'];

  useFocusEffect(
    useCallback(() => { carregarDados(); }, [])
  );

  const carregarDados = async () => {
    const c = await carregar('cartoes');
    const l = await carregar('cartao_lancamentos');
    setCartoes(c);
    setLancamentos(l);
    if (c.length > 0 && !cartaoSel) setCartaoSel(c[0].nome);
  };

  const adicionarCartao = async () => {
    if (!nome) return Alert.alert('Atenção', 'Preencha o nome!');
    const novo = { id: Date.now().toString(), nome, final: final||'0000', limite: parseFloat(limite||0), bandeira };
    const novos = [...cartoes, novo];
    setCartoes(novos);
    await salvar('cartoes', novos);
    if (novos.length === 1) setCartaoSel(novo.nome);
    setModalCartao(false);
    setNome(''); setFinal(''); setLimite('');
  };

  const adicionarLanc = async () => {
    if (!descLanc || !valorLanc) return Alert.alert('Atenção', 'Preencha descrição e valor!');
    const novo = {
      id: Date.now().toString(),
      descricao: descLanc,
      valor: parseFloat(valorLanc),
      cartao: cartaoSel,
      parcelas: parseInt(parcelas||1),
      data: new Date().toLocaleDateString('pt-BR'),
    };
    const novos = [...lancamentos, novo];
    setLancamentos(novos);
    await salvar('cartao_lancamentos', novos);
    setModalLanc(false);
    setDescLanc(''); setValorLanc(''); setParcelas('1');
  };

  const deletarCartao = async (id) => {
    Alert.alert('Remover', 'Remover este cartão?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const novos = cartoes.filter(x => x.id !== id);
        setCartoes(novos);
        await salvar('cartoes', novos);
      }},
    ]);
  };

  const deletarLanc = async (id) => {
    Alert.alert('Remover', 'Remover este lançamento?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const novos = lancamentos.filter(x => x.id !== id);
        setLancamentos(novos);
        await salvar('cartao_lancamentos', novos);
      }},
    ]);
  };

  const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Meus</Text>
          <Text style={styles.title}>Cartões</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cartões</Text>
            <TouchableOpacity onPress={() => setModalCartao(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
          {cartoes.length === 0 ? (
            <Text style={styles.empty}>💳 Nenhum cartão ainda</Text>
          ) : (
            cartoes.map((c, i) => (
              <TouchableOpacity key={c.id} onLongPress={() => deletarCartao(c.id)}
                style={[styles.cardVisual, { backgroundColor: gradients[i % gradients.length] }]}>
                <Text style={styles.cardBand}>{c.bandeira}</Text>
                <Text style={styles.cardNum}>•••• •••• •••• {c.final}</Text>
                <Text style={styles.cardHolder}>{c.nome}</Text>
                <View style={styles.cardLimit}>
                  <Text style={styles.cardLimitLabel}>Limite</Text>
                  <Text style={styles.cardLimitVal}>{fmt(c.limite)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lançamentos</Text>
            <TouchableOpacity onPress={() => setModalLanc(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Lançamento</Text>
            </TouchableOpacity>
          </View>
          {lancamentos.length === 0 ? (
            <Text style={styles.empty}>🧾 Nenhum lançamento ainda</Text>
          ) : (
            [...lancamentos].reverse().map(l => (
              <TouchableOpacity key={l.id} style={styles.lancItem} onLongPress={() => deletarLanc(l.id)}>
                <View style={styles.lancIcon}>
                  <Text style={{ fontSize: 22 }}>💳</Text>
                </View>
                <View style={styles.lancInfo}>
                  <Text style={styles.lancDesc}>{l.descricao}</Text>
                  <Text style={styles.lancCat}>{l.cartao} · {l.parcelas}x · {l.data}</Text>
                </View>
                <Text style={styles.lancVal}>-{fmt(l.valor)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Cartão */}
      <Modal visible={modalCartao} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Novo Cartão</Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} placeholder="Ex: Nubank, Itaú..." placeholderTextColor="#64748b" value={nome} onChangeText={setNome} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Últimos 4 dígitos</Text>
                <TextInput style={styles.input} placeholder="0000" placeholderTextColor="#64748b" keyboardType="numeric" maxLength={4} value={final} onChangeText={setFinal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Limite (R$)</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={limite} onChangeText={setLimite} />
              </View>
            </View>
            <Text style={styles.label}>Bandeira</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {bandeiras.map(b => (
                <TouchableOpacity key={b} onPress={() => setBandeira(b)}
                  style={[styles.catBtn, bandeira === b && { backgroundColor: '#a78bfa', borderColor: '#a78bfa' }]}>
                  <Text style={[styles.catBtnText, bandeira === b && { color: '#fff' }]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalCartao(false)}>
                <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: '#a78bfa' }]} onPress={adicionarCartao}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Lançamento */}
      <Modal visible={modalLanc} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Novo Lançamento</Text>
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={styles.input} placeholder="Ex: Amazon, iFood..." placeholderTextColor="#64748b" value={descLanc} onChangeText={setDescLanc} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Valor (R$)</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#64748b" keyboardType="decimal-pad" value={valorLanc} onChangeText={setValorLanc} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Parcelas</Text>
                <TextInput style={styles.input} placeholder="1" placeholderTextColor="#64748b" keyboardType="numeric" value={parcelas} onChangeText={setParcelas} />
              </View>
            </View>
            {cartoes.length > 0 && (
              <>
                <Text style={styles.label}>Cartão</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {cartoes.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => setCartaoSel(c.nome)}
                      style={[styles.catBtn, cartaoSel === c.nome && { backgroundColor: '#a78bfa', borderColor: '#a78bfa' }]}>
                      <Text style={[styles.catBtnText, cartaoSel === c.nome && { color: '#fff' }]}>💳 {c.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalLanc(false)}>
                <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: '#a78bfa' }]} onPress={adicionarLanc}>
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
  header: { padding: 24, paddingTop: 60, backgroundColor: '#150d28' },
  subtitle: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#a78bfa', marginBottom: 8 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e8eef8' },
  addBtn: { backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  addBtnText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  empty: { color: '#64748b', textAlign: 'center', padding: 32, fontSize: 14 },
  cardVisual: { borderRadius: 20, padding: 24, marginBottom: 14, minHeight: 150, position: 'relative' },
  cardBand: { fontSize: 11, fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18, color: '#fff' },
  cardNum: { fontSize: 17, fontWeight: '700', letterSpacing: 3, marginBottom: 8, color: '#fff' },
  cardHolder: { fontSize: 13, color: '#fff', opacity: 0.85 },
  cardLimit: { position: 'absolute', bottom: 20, right: 20, alignItems: 'flex-end' },
  cardLimitLabel: { fontSize: 9, color: '#fff', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.8 },
  cardLimitVal: { fontSize: 15, fontWeight: '700', color: '#fff' },
  lancItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131e30', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f3050' },
  lancIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(167,139,250,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lancInfo: { flex: 1 },
  lancDesc: { fontSize: 14, fontWeight: '500', color: '#e8eef8' },
  lancCat: { fontSize: 11, color: '#64748b', marginTop: 2 },
  lancVal: { fontSize: 15, fontWeight: '600', color: '#f43f5e' },
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