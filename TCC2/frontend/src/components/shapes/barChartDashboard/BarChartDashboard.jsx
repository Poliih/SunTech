import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './BarChartDashboard.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChartDashboard = () => {
  const [dados, setDados] = useState({ meses: [], mediasConsumo: [], mediasPrevisaoIA: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/comparacao_consumo');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados de consumo e previsão');
        }
        const data = await response.json();

        // Extrair os dados de cada mês
        const meses = data.map(d => d.mes);
        const mediasConsumo = data.map(d => parseFloat(d.media_consumo));
        const mediasPrevisaoIA = data.map(d => parseFloat(d.media_previsao));

        setDados({ meses, mediasConsumo, mediasPrevisaoIA });
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchData();
  }, []);

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (erro) {
    return <div>Erro: {erro}</div>;
  }

  const { meses, mediasConsumo, mediasPrevisaoIA } = dados;

  const data = {
    labels: meses,
    datasets: [
      {
        label: 'Média Real',
        data: mediasConsumo,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Média IA',
        data: mediasPrevisaoIA,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Comparação de Consumo Real e Previsão da IA por Mês',
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChartDashboard;
