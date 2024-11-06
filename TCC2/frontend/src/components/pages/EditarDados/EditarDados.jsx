import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarDados.css'; // Importando o arquivo CSS

const EditarDados = () => {
  const { empresa, uc, mes_ref } = useParams(); 
  const [dados, setDados] = useState({}); 
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  const formatarTipoInstalacao = (tipo) => {
    switch (tipo) {
      case 'bifasico':
        return 'Bifásico';
      case 'monofasico':
        return 'Monofásico';
      case 'trifasico':
        return 'Trifásico';
      default:
        return tipo;
    }
  };

  useEffect(() => {
    if (!empresa || !uc || !mes_ref) {
      console.error('Parâmetros inválidos. Navegando de volta.');
      navigate('/dados'); 
      return; 
    }

    const fetchDados = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/dados_consumo/${empresa}/${uc}/${mes_ref}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const data = await response.json();
        console.log(data); 

        if (data && typeof data === 'object') { 
          setDados(data); 
        } else {
          console.error('Os dados retornados não estão na estrutura esperada:', data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [empresa, uc, mes_ref, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const novoDados = { ...dados, [name]: value }; 

    // Atualiza o custo de disponibilidade com base no tipo de instalação
    if (name === 'Tipo_de_Instalacao') {
      switch (value) {
        case 'Bifásico':
          novoDados.Custo_de_Disponibilidade = 50;
          break;
        case 'Monofásico':
          novoDados.Custo_de_Disponibilidade = 30;
          break;
        case 'Trifásico':
          novoDados.Custo_de_Disponibilidade = 100;
          break;
        default:
          novoDados.Custo_de_Disponibilidade = ''; 
          break;
      }
    }

    setDados(novoDados); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { empresa, uc, mes_ref, ...dadosParaAtualizar } = dados; 

      const response = await fetch(`http://127.0.0.1:5000/api/dados_consumo/${empresa}/${uc}/${mes_ref}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaAtualizar), 
      });

      if (!response.ok) {
        throw new Error('Erro ao editar dados');
      }

      navigate(`/dados`); 
    } catch (error) {
      console.error('Erro ao editar dados:', error);
    }
  };

  if (loading) return <p>Carregando...</p>; 

  return (
    <div className="form-container">
      <h1>Editar Dados da Unidade Consumidora</h1>
      <form onSubmit={handleSubmit} className="dados-form">
        <div className="form-group">
          <label htmlFor="empresa">Nome da Empresa:</label>
          <input
            type="text"
            id="empresa"
            name="empresa"
            value={dados.empresa || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="uc">UC:</label>
          <input
            type="text"
            id="uc"
            name="uc"
            value={dados.uc || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mes_ref">Mês de Referência:</label>
          <input
            type="text"
            id="mes_ref"
            name="mes_ref"
            value={dados.mes_ref || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="Tipo_de_Instalacao">Tipo de Instalação:</label>
          <select
            id="Tipo_de_Instalacao"
            name="Tipo_de_Instalacao"
            value={formatarTipoInstalacao(dados.Tipo_de_Instalacao) || ''}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            <option value="Bifásico">Bifásico</option>
            <option value="Monofásico">Monofásico</option>
            <option value="Trifásico">Trifásico</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="Custo_de_Disponibilidade">Custo de Disponibilidade:</label>
          <input
            type="number"
            id="Custo_de_Disponibilidade"
            name="Custo_de_Disponibilidade"
            value={dados.Custo_de_Disponibilidade || ''} 
            readOnly 
          />
        </div>
        <div className="form-group">
          <label htmlFor="consumo">Consumo:</label>
          <input
            type="number"
            id="consumo"
            name="consumo"
            value={dados.consumo || ''}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="injetado">Injetado:</label>
          <input
            type="number"
            id="injetado"
            name="injetado"
            value={dados.injetado || ''}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="saldo">Saldo:</label>
          <input
            type="number"
            id="saldo"
            name="saldo"
            value={dados.saldo || ''}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="submit-button">Salvar</button>
      </form>
    </div>
  );
};

export default EditarDados;
