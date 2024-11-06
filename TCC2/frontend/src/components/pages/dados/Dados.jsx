import React, { useEffect, useState } from 'react';
import ShapeRectangle from '../../shapes/Rectangle/ShapeRectangle';
import TableDetails from '../../shapes/Table/TableDetails';
import './Dados.css'; 

const Dados = () => {
  const [totalUCs, setTotalUCs] = useState(0);
  const [totalConsumo, setTotalConsumo] = useState(0);
  const [totalReferencias, setTotalReferencias] = useState(0);
  const [filterParams, setFilterParams] = useState({
    n_cliente: '',
    referencia: ''
  });

  useEffect(() => {
    const fetchDados = async () => {
      const { n_cliente } = filterParams;
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/dados_consumo_br?n_cliente=${n_cliente}`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados da API:", data);

        if (Array.isArray(data)) {
          // Total de UC
          const ucsUnicos = new Set(data.map(item => item.uc).filter(Boolean));
          setTotalUCs(ucsUnicos.size);
          console.log("Total de UCs:", ucsUnicos.size);

          // Total de Consumo
          const total = data.reduce((acc, item) => acc + (parseFloat(item.consumo.replace(',', '.')) || 0), 0);
          setTotalConsumo(total);
          console.log("Soma do Consumo:", total);

          // Total de Referências
          const referenciasUnicas = new Set(data.map(item => item.mes_ref).filter(Boolean));
          setTotalReferencias(referenciasUnicas.size);
          console.log("Total de Referências:", referenciasUnicas.size);
        } else {
          console.error("Os dados não são um array:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      }
    };

    fetchDados();
  }, [filterParams]);

  const handleFilterChange = (e) => {
    setFilterParams({
      ...filterParams,
      [e.target.name]: e.target.value
    });
  };

  const formatarConsumo = (valor) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="App">
      <main>
        <h1 className="page-title">Dados</h1> 
        <div className="shape-container">
          <ShapeRectangle 
            titulo="Quantidade de UCs" 
            valor={totalUCs} 
            unidade="UCs" 
          />
          <ShapeRectangle 
            titulo="Consumo Total"
            valor={formatarConsumo(totalConsumo)} 
            unidade="kWh"
          />
          <ShapeRectangle 
            titulo="Total de Referências"
            valor={totalReferencias}
            unidade="referências"
          />
        </div>
        <div className="table-container">
          <TableDetails /> 
        </div>
      </main>
    </div>
  );
};

export default Dados;
