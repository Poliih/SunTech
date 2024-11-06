import React, { useEffect, useState } from 'react';
import ShapeRectangle from '../../shapes/Rectangle/ShapeRectangle'; 
import TableRateio from '../../shapes/TableRateio/TableRateio';
import './Rateio.css'; 

const Dados = () => {
  const [totalUsinas, setTotalUsinas] = useState(0);
  const [saldoMaiorMes, setSaldoMaiorMes] = useState(0); 
  const [mediaUsinas, setMediaUsinas] = useState(0); 

  useEffect(() => {
    // Buscar a quantidade de usinas da API
    const fetchUsinas = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/rateio_consumo');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const data = await response.json();

        const uniqueUsinas = new Set(data.map(rateio => rateio.usina));
        setTotalUsinas(uniqueUsinas.size); 
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    // Buscar o saldo do maior mês da API
    const fetchSaldoMaiorMes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/dados_consumo');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const data = await response.json();
        const mesesRef = data.map(item => item.mes_ref);
        const maiorMesRef = Math.max(...mesesRef.map(mes => new Date(mes).getTime())); 

        const saldoMaiorMes = data
          .filter(item => new Date(item.mes_ref).getTime() === maiorMesRef)
          .reduce((total, item) => total + item.saldo, 0);

        setSaldoMaiorMes(saldoMaiorMes); 
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    // FBuscar e calcular a média anual de geração das usinas
    const fetchMediaUsinas = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/dados_geracao');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados de geração');
        }
        const data = await response.json();

        // Agrupa os dados por usina e ano
        const usinas = {};
        data.forEach(item => {
          const ano = new Date(item.mes_ref).getFullYear(); 
          const chave = `${item.usina}_${ano}`;

          if (!usinas[chave]) {
            usinas[chave] = {
              totalGeracao: 0,
              contagem: 0
            };
          }

          usinas[chave].totalGeracao += item.geracao; 
          usinas[chave].contagem += 1; 
        });

        // Calcula a média anual de cada usina
        const mediasUsinas = Object.values(usinas).map(({ totalGeracao, contagem }) => {
          return totalGeracao / contagem;
        });

        // Soma as médias das usinas
        const somaMedias = mediasUsinas.reduce((acc, curr) => acc + curr, 0);
        setMediaUsinas(somaMedias); 
      } catch (error) {
        console.error('Erro ao buscar dados de geração da API:', error);
      }
    };

    fetchUsinas(); 
    fetchSaldoMaiorMes(); 
    fetchMediaUsinas();
  }, []); 

  return (
    <div className="App">
      <main>
        <h1 className="page-title2">Rateio</h1>
        <div className="shape-container">
          <ShapeRectangle 
            titulo="Quantidade de Usinas" 
            valor={totalUsinas} 
            unidade="usinas" 
          />
          <ShapeRectangle 
            titulo="Saldo acumulado"
            valor={saldoMaiorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} // Mostrando o saldo do maior mês formatado
            unidade="kWh"
          />
          <ShapeRectangle 
            titulo="Média de Geração das Usinas"
            valor={mediaUsinas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} // Mostrando a soma das médias das usinas formatada
            unidade="kWh" 
          />
        </div>
        <div className="table-container">
          <TableRateio /> 
        </div>
      </main>
    </div>
  );
};

export default Dados;
