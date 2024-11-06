import React, { useEffect, useState } from 'react';
import ShapeRectangle from '../../shapes/Rectangle/ShapeRectangle'; 
import BarChartDashboard from '../../shapes/barChartDashboard/BarChartDashboard';
import { faChartSimple } from '@fortawesome/free-solid-svg-icons'; 
import { faFile, faCopy } from '@fortawesome/free-regular-svg-icons';
import './Dashboard.css';

function Dashboard() {
  const [correlacao, setCorrelacao] = useState(null);
  const [mediaReal, setMediaReal] = useState(null);
  const [mediaIA, setMediaIA] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchDadosComparacao = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/comparacao_consumo');
        if (!response.ok) {
          throw new Error('Erro na rede ao buscar dados de comparação de consumo');
        }
        const data = await response.json();

        if (data.length > 0) {
          const totalConsumo = data.reduce((acc, mes) => acc + parseFloat(mes.media_consumo), 0);
          const totalPrevisao = data.reduce((acc, mes) => acc + parseFloat(mes.media_previsao), 0);
          const mediaConsumo = totalConsumo / data.length;
          const mediaPrevisao = totalPrevisao / data.length;

          setCorrelacao(parseFloat(data[0].correlacao * 100)); 
          setMediaReal(mediaConsumo);
          setMediaIA(mediaPrevisao);
        }
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchDadosComparacao();
  }, []);

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (erro) {
    return <div>Erro: {erro}</div>;
  }

  return (
    <div className="App">
      <main>
      <h1 className="page-title2">Dashboard</h1> 
        <div className="shape-container">
          <ShapeRectangle 
            titulo="Correlação: Real x IA"
            valor={correlacao !== null ? correlacao.toFixed(2) : '0.00'}
            unidade="%"
            icone={faChartSimple} 
          />
          <ShapeRectangle 
            titulo="Média Real"
            valor={mediaReal !== null ? mediaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
            unidade="kWh"
            icone={faFile} 
          />
          <ShapeRectangle 
            titulo="Média IA"
            valor={mediaIA !== null ? mediaIA.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
            unidade="kWh"
            icone={faCopy} 
          />
        </div>
        <div className="table-container">
          <BarChartDashboard />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
