import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { carregar } from '../storage';
import { getUsuario } from '../auth';
import * as SecureStore from 'expo-secure-store';

export default function Resumo({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [foto, setFoto] = useState(null);

  useFocusEffect(
    useCallback(() => { carregarDados(); }, [])
  );

  const carregarDados = async () => {
    setReceitas(await carregar('receitas'));
    setGastos(await carregar('gastos'));
    setInvestimentos(await carregar('investimentos'));
    const u = await getUsuario();
    setUsuario(u);
    const fotoSalva = await SecureStore.getItemAsync('foto_perfil');
    if (fotoSalva) setFoto(fotoSalva);
  };

  const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const totalRec = receitas.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const totalGas = gastos.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const totalInv = investimentos.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const saldo = totalRec - totalGas;

  const ultimas = [
    ...receitas.map(x => ({...x, tipo:'receita'})),
    ...gastos.map(x => ({...x, tipo:'gasto'}))
  ].slice(-6).reverse();

  const iniciais = usuario?.nome ? usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appName}>FinançasPro</Text>
            <Text style={styles.saudacao}>{saudacao()}, {usuario?.nome?.split(' ')[0] || 'usuário'}! 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')} style={styles.avatarBtn}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.avatarFoto} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIniciais}>{iniciais}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Saldo do mês</Text>
        <Text style={[styles.saldo, { color: saldo >= 0 ? '#10b981' : '#f43f5e' }]}>{fmt(saldo)}</Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Receitas</Text>
            <Text style={[styles.chipVal, { color: '#10b981' }]}>{fmt(totalRec)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Gastos</Text>
            <Text style={[styles.chipVal, { color: '#f43f5e' }]}>{fmt(totalGas)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Patrimônio</Text>
            <Text style={[styles.chipVal, { color: '#f59e0b' }]}>{fmt(totalInv)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas transações</Text>
        {ultimas.length === 0 ? (
          <Text style={styles.empty}>💰 Nenhuma transação ainda</Text>
        ) : (
          ultimas.map(x => (
            <View key={x.id} style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: x.tipo === 'receita' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)' }]}>
                <Text style={{ fontSize: 20 }}>{x.tipo === 'receita' ? '💵' : '🧾'}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemDesc}>{x.descricao}</Text>
                <Text style={styles.itemCat}>{x.categoria} · {x.data}</Text>
              </View>
              <Text style={[styles.itemVal, { color: x.tipo === 'receita' ? '#10b981' : '#f43f5e' }]}>
                {x.tipo === 'receita' ? '+' : '-'}{fmt(x.valor)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#0f1e38' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 18, fontWeight: '800', color: '#00d4ff' },
  saudacao: { fontSize: 14, color: '#64748b', marginTop: 2 },
  avatarBtn: { padding: 2 },
  avatarFoto: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#00d4ff' },
  avatarPlaceholder: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a2840', borderWidth: 2, borderColor: '#00d4ff', alignItems: 'center', justifyContent: 'center' },
  avatarIniciais: { fontSize: 16, fontWeight: '800', color: '#00d4ff' },
  label: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  saldo: { fontSize: 36, fontWeight: '800', marginTop: 4, marginBottom: 16 },
  chips: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: '#131e30', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#1f3050' },
  chipLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  chipVal: { fontSize: 13, fontWeight: '600' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e8eef8', marginBottom: 12 },
  empty: { color: '#64748b', textAlign: 'center', padding: 32, fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131e30', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f3050' },
  itemIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemInfo: { flex: 1 },
  itemDesc: { fontSize: 14, fontWeight: '500', color: '#e8eef8' },
  itemCat: { fontSize: 11, color: '#64748b', marginTop: 2 },
  itemVal: { fontSize: 15, fontWeight: '600' },
});