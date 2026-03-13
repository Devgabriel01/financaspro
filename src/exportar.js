import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { carregar } from './storage';

const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export const exportarPDF = async (usuario) => {
  const receitas = await carregar('receitas');
  const gastos = await carregar('gastos');
  const investimentos = await carregar('investimentos');

  const totalRec = receitas.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const totalGas = gastos.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const totalInv = investimentos.reduce((a, x) => a + parseFloat(x.valor||0), 0);
  const saldo = totalRec - totalGas;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
        h1 { color: #0284c7; font-size: 28px; margin-bottom: 4px; }
        .sub { color: #64748b; font-size: 14px; margin-bottom: 32px; }
        .resumo { display: flex; gap: 16px; margin-bottom: 32px; }
        .card { flex: 1; padding: 16px; border-radius: 12px; text-align: center; }
        .card-rec { background: #dcfce7; }
        .card-gas { background: #fee2e2; }
        .card-inv { background: #fef3c7; }
        .card-sal { background: #dbeafe; }
        .card h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin: 0 0 8px; }
        .card p { font-size: 18px; font-weight: bold; margin: 0; }
        .rec { color: #16a34a; }
        .gas { color: #dc2626; }
        .inv { color: #d97706; }
        .sal { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        h2 { color: #1e293b; font-size: 18px; margin: 24px 0 12px; border-left: 4px solid #0284c7; padding-left: 12px; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px; }
      </style>
    </head>
    <body>
      <h1>💰 FinançasPro</h1>
      <p class="sub">Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} • ${usuario?.nome || 'Usuário'}</p>

      <div class="resumo">
        <div class="card card-rec"><h3>Receitas</h3><p class="rec">${fmt(totalRec)}</p></div>
        <div class="card card-gas"><h3>Gastos</h3><p class="gas">${fmt(totalGas)}</p></div>
        <div class="card card-inv"><h3>Patrimônio</h3><p class="inv">${fmt(totalInv)}</p></div>
        <div class="card card-sal"><h3>Saldo</h3><p class="sal">${fmt(saldo)}</p></div>
      </div>

      <h2>Receitas</h2>
      <table>
        <tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th></tr>
        ${receitas.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8">Nenhuma receita</td></tr>' :
          receitas.map(r => `<tr><td>${r.descricao}</td><td>${r.categoria}</td><td>${r.data}</td><td class="rec">${fmt(r.valor)}</td></tr>`).join('')}
      </table>

      <h2>Gastos</h2>
      <table>
        <tr><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Data</th><th>Valor</th></tr>
        ${gastos.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#94a3b8">Nenhum gasto</td></tr>' :
          gastos.map(g => `<tr><td>${g.descricao}</td><td>${g.categoria}</td><td>${g.tipo === 'fixo' ? 'Fixo' : 'Variável'}</td><td>${g.data}</td><td class="gas">${fmt(g.valor)}</td></tr>`).join('')}
      </table>

      <h2>Investimentos</h2>
      <table>
        <tr><th>Nome</th><th>Tipo</th><th>Retorno a.a.</th><th>Valor</th></tr>
        ${investimentos.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8">Nenhum investimento</td></tr>' :
          investimentos.map(i => `<tr><td>${i.nome}</td><td>${i.tipo}</td><td>${i.retorno}%</td><td class="inv">${fmt(i.valor)}</td></tr>`).join('')}
      </table>

      <div class="footer">Gerado pelo FinançasPro • ${new Date().toLocaleDateString('pt-BR')}</div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const destino = FileSystem.documentDirectory + `FinancasPro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: destino });
  await Sharing.shareAsync(destino, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar relatório' });
};

export const exportarCSV = async (usuario) => {
  const receitas = await carregar('receitas');
  const gastos = await carregar('gastos');
  const investimentos = await carregar('investimentos');

  let csv = 'Tipo,Descrição,Categoria,Valor,Data\n';
  receitas.forEach(r => { csv += `Receita,"${r.descricao}","${r.categoria}",${r.valor},"${r.data}"\n`; });
  gastos.forEach(g => { csv += `Gasto,"${g.descricao}","${g.categoria}",${g.valor},"${g.data}"\n`; });
  investimentos.forEach(i => { csv += `Investimento,"${i.nome}","${i.tipo}",${i.valor},""\n`; });

  const path = FileSystem.documentDirectory + `FinancasPro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Compartilhar CSV' });
};