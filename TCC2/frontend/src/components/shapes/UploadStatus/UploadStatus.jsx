import React, { useState } from 'react';
import axios from 'axios';
import './UploadStatus.css';

const UploadStatus = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [predictionData, setPredictionData] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus('');
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Por favor, selecione um arquivo CSV para upload.');
            return;
        }

        setIsUploading(true);
        setUploadStatus('Enviando arquivo...');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/upload_csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadStatus('Arquivo enviado com sucesso! Processando dados e gerando previsões...');
            setPredictionData(response.data);  
            setIsUploading(false);

        } catch (error) {
            setError('Erro durante o upload ou na geração de previsões. Por favor, tente novamente.');
            setIsUploading(false);
        }
    };

    return (
        <div className="upload-status-container">
            <h2>Upload de Arquivo e Geração de Previsões</h2>

            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
            </button>

            {uploadStatus && <p className="status-message">{uploadStatus}</p>}
            {error && <p className="error-message">{error}</p>}

            {predictionData && (
                <div className="prediction-results">
                    <h3>Resultados da Previsão:</h3>
                    <ul>
                        {predictionData.map((item, index) => (
                            <li key={index}>
                                Unidade: {item.unidade} | Consumo Previsto: {item.consumo} kWh
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UploadStatus;
