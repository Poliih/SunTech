import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import Square from '../../shapes/Square/Square';
import './Importar.css';

// Modelo CSV para dados de consumo
const modeloConsumoCsv = `usina;uc;mes_ref;consumo;injetado;saldo;Tipo_de_Instalacao;Custo_de_Disponibilidade
Usina A;UC001;01/01/2023;1500;1470;1000;Monofásico;30
Usina B;UC002;01/01/2023;1200;1150;600;Bifásico;50
Usina C;UC003;01/02/2023;1750;1600;1000;Trifásico;100
`;

// Modelo CSV para dados de geração
const modeloGeracaoCsv = `usina;mes_ref;geracao
Usina A;01/01/2023;1200
Usina B;01/01/2023;1300
Usina C;01/02/2023;1100
`;

const downloadFile = (content, fileName) => {
  const bom = '\uFEFF'; 
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const formatMesRef = (mesRef) => {
  const year = Math.floor(mesRef / 100); 
  const month = mesRef % 100; 
  return `01/${String(month).padStart(2, '0')}/${year}`;
};

function Importar() {
  const [uploadStatus, setUploadStatus] = useState({
    uploading: false,
    success: null, 
    message: ''
  });

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];

    if (!file) {
      alert('Por favor, selecione um arquivo.');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Definindo a URL da API para upload, alterando conforme o tipo
    const apiUrl = type === 'consumo' 
      ? 'http://localhost:5000/api/upload_csv' 
      : 'http://localhost:5000/api/upload_geracao'; 
    console.log(`Enviando arquivo para: ${apiUrl}`); 

    // Inicia o processo de upload
    setUploadStatus({ uploading: true, success: null, message: 'Enviando arquivo...' });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Resposta da API:', response); 

      if (response.ok) {
        const responseData = await response.json(); 
        console.log('Dados de resposta:', responseData); 

        setUploadStatus({
          uploading: false,
          success: true,
          message: `Arquivo de ${type} "${file.name}" enviado com sucesso!`
        });
        event.target.value = ''; 
      } else {
        const errorData = await response.json();
        console.error('Erro:', errorData);
        setUploadStatus({
          uploading: false,
          success: false,
          message: `Erro ao enviar o arquivo de ${type}: ${errorData.error || 'Um erro ocorreu'}`
        });
      }
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      console.error('Detalhes do erro:', error.message); 
      setUploadStatus({
        uploading: false,
        success: false,
        message: `Erro ao enviar o arquivo de ${type}.`
      });
    }
  };

  return (
    <div className="App">
      <div className="shape-container">
        <Square 
          titulo="Importar Consumo" 
          icone={faFileUpload} 
          descricao={{ texto: 'Clique para importar' }}
          onClickDescricao={() => document.getElementById('inputConsumo').click()}
        />
        <input 
          id="inputConsumo" 
          type="file" 
          accept=".csv" 
          onChange={(e) => handleFileUpload(e, 'consumo')} 
          style={{ display: 'none' }} 
          aria-label="Selecionar arquivo de consumo"
        />
        
        <Square 
          titulo="Importar Geração" 
          icone={faFileUpload} 
          descricao={{ texto: 'Clique para importar' }}
          onClickDescricao={() => document.getElementById('inputGeracao').click()} 
        />
        <input 
          id="inputGeracao" 
          type="file" 
          accept=".csv" 
          onChange={(e) => handleFileUpload(e, 'geracao')} 
          style={{ display: 'none' }} 
          aria-label="Selecionar arquivo de geração"
        />
        
        <Square 
          titulo="Modelo CSV" 
          icone={faFileDownload} 
          descricao2={{ texto: 'Dados de Consumo' }}
          descricao3={{ texto: 'Dados de Geração' }}
          onClickDescricao={() => downloadFile(modeloConsumoCsv, 'modelo_consumo.csv')}
          onClickDescricao2={() => downloadFile(modeloGeracaoCsv, 'modelo_geracao.csv')}
        />
      </div>

      {/*Status de Upload*/}
      <div className="upload-status-container">
        {uploadStatus.uploading && <div className="uploading-status">Upload em andamento...</div>}
        {uploadStatus.success !== null && !uploadStatus.uploading && (
          <div className={`upload-message ${uploadStatus.success ? 'success' : 'error'}`}>
            {uploadStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Importar;
