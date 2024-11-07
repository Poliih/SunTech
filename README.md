
# SunTech - Previsão e Rateio de Consumo de Energia Solar com Inteligência Artificial

**Desenvolvido por Poliana Rodrigues da Silva**

## Descrição do Projeto

O SunTech é um sistema de previsão e rateio de consumo de energia solar desenvolvido para o TCC intitulado **"Inteligência Artificial na Geração Distribuída de Energia Solar: Análise de Rateio"**. Este projeto utiliza redes neurais LSTM para prever o consumo de energia elétrica em múltiplas unidades consumidoras e calcula o rateio de forma automatizada, visando uma gestão eficiente no Sistema de Compensação de Energia Elétrica (SCEE).

### Funcionalidades

- **Previsão de Consumo**: Modelo LSTM para prever o consumo elétrico dos próximos 12 meses com base em dados históricos.
- **Cálculo de Rateio**: Distribuição automática de consumo e geração de energia entre unidades consumidoras, com opção de considerar saldos acumulados.
- **Importação de Dados**: Carregamento de dados via arquivos CSV para atualizar o banco de dados e treinar o modelo.
- **Interface de Usuário**: Front-end em React com telas intuitivas para importação, dashboard, dados e rateio.

## Estrutura do Projeto

- **Backend**: Python com Flask para API e SQLAlchemy para gerenciamento do banco de dados.
- **Frontend**: Desenvolvido em React para uma interface amigável.
- **Banco de Dados**: MySQL, armazenando dados históricos e resultados das previsões.
- **Modelagem de IA**: Rede Neural LSTM implementada em TensorFlow.

## Requisitos de Instalação

Execute os seguintes comandos para instalar todas as dependências do projeto:

### Instalação do Frontend

```bash
npm install --save @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
npm install chart.js react-chartjs-2
npm install @tanstack/react-table
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/x-data-grid
npm install react-table styled-components
npm install react-icons
npm install @chakra-ui/react framer-motion
npm install @mui/x-date-pickers @date-io/date-fns
npm install date-fns
npm install express multer csv-parser mysql dotenv
npm install json2csv
```

### Instalação do Backend

```bash
pip install Flask Flask-SQLAlchemy mysql-connector-python
pip install matplotlib seaborn
pip install flask-mysqldb
pip install -U werkzeug
pip install requests pandas numpy scikit-learn tensorflow sqlalchemy
```

## Uso

1. **Iniciar o Backend**:
   - Navegue até o diretório do backend e execute:
     ```bash
     flask run
     ```

2. **Iniciar o Frontend**:
   - Navegue até o diretório do frontend e execute:
     ```bash
     npm start
     ```

3. **Importar Dados**:
   - Utilize a tela de importação no SunTech para carregar dados de consumo via arquivos CSV.

4. **Visualizar Previsões e Rateio**:
   - Acesse a tela do Dashboard para visualizar os dados previstos e o cálculo do rateio.

## Tecnologias Utilizadas

- **Backend**: Python, Flask, SQLAlchemy
- **Frontend**: React, MUI, Chart.js
- **Banco de Dados**: MySQL
- **Inteligência Artificial**: TensorFlow (modelo LSTM)


### **API Endpoints**

#### **Dados de Geração**
- **Endpoint:** `/api/dados_geracao`
- **Método:** `GET`
- **Descrição:** Retorna dados de geração de energia por usina.
- **Exemplo de Resposta:**
  ```json
  {
    "geracao": 112863541.0,
    "mes_ref": "2022-05-01",
    "usina": "Usina_W"
  }
  ```

#### **Rateio Consumo**
- **Endpoint:** `/api/rateio_consumo`
- **Método:** `GET`
- **Descrição:** Retorna informações sobre o rateio de consumo por unidade consumidora (UC).
- **Exemplo de Resposta:**
  ```json
  {
    "consumo": 492.97,
    "mes": "2025-01-01",
    "mes_acaba_saldo": null,
    "rateio": 0.34,
    "rateio_saldo": null,
    "uc": "10010001",
    "usina": "Usina_X"
  }
  ```

#### **Rateio Consumo com Filtro**
- **Endpoint:** `/api/rateio_consumo/filter`
- **Método:** `GET`
- **Descrição:** Retorna informações de rateio de consumo filtrado por usina, UC, mês, ordenação e direção de ordenação.
- **Parâmetros de Consulta:**
  - `usina`: string
  - `uc`: string
  - `mes`: string (formato 'YYYY-MM-DD')
  - `orderBy`: string (coluna de ordenação)
  - `orderDirection`: string (direção da ordenação - asc/desc)
- **Exemplo de Resposta:**
  ```json
  {
    "consumo": 1684.45,
    "mes": "2025-06-01",
    "mes_acaba_saldo": null,
    "rateio": 1.48,
    "rateio_saldo": null,
    "uc": "10030100",
    "usina": "Usina_W"
  }
  ```

#### **Média de Consumo e Previsão Mensal**
- **Endpoint:** `/api/media_consumo_previsao_mensal`
- **Método:** `GET`
- **Descrição:** Retorna a média de consumo e previsão mensal de consumo.
- **Exemplo de Resposta:**
  ```json
  {
    "01": {
      "media_consumo_previsao": "1420,50"
    },
    "02": {
      "media_consumo_previsao": "1372,35"
    }
  }
  ```

#### **Dados de Consumo da IA (BR)**
- **Endpoint:** `/api/dados_consumo_ia_br`
- **Método:** `GET`
- **Descrição:** Retorna os dados de consumo previstos pela IA em formato BR.
- **Exemplo de Resposta:**
  ```json
  {
    "consumo_previsao": "492,9715881347656",
    "mes_ref_previsao": "01/01/2025",
    "uc": "10010001"
  }
  ```

#### **Dados de Consumo da IA**
- **Endpoint:** `/api/dados_consumo_ia`
- **Método:** `GET`
- **Descrição:** Retorna os dados de consumo previstos pela IA.
- **Exemplo de Resposta:**
  ```json
  {
  "consumo_previsao": 492.9715881347656,
  "mes_ref_previsao": "2025-01-01",
  "uc": "10010001"
  }
  ```

#### **Comparação de Consumo**
- **Endpoint:** `/api/comparacao_consumo`
- **Método:** `GET`
- **Descrição:** Retorna métricas de comparação entre consumo real e previsão, como correlação e erro médio.
- **Exemplo de Resposta:**
  ```json
  {
    "correlacao": "0.9953788339356017",
    "mae": "25.847978573438883",
    "media_consumo": "1441.1888166666668",
    "media_previsao": "1420.4955148824056",
    "mes": "Janeiro",
    "r_squared": "0.9887252455294114",
    "rmse": "30.825430368572075"
  }
  ```

#### **Média de Consumo e Injetado Mensal**
- **Endpoint:** `/api/media_consumo_injetado_mensal`
- **Método:** `GET`
- **Descrição:** Retorna a média mensal de consumo e energia injetada.
- **Exemplo de Resposta:**
  ```json
  {
    "01": {
      "media_consumo": "1441,19",
      "media_injetado": "877,74"
    },
    "02": {
      "media_consumo": "1393,57",
      "media_injetado": "855,09"
    }
  }
  ```

#### **Dados de Consumo (BR)**
- **Endpoint:** `/api/dados_consumo_br`
- **Método:** `GET`
- **Descrição:** Retorna os dados de consumo no formato brasileiro.
- **Exemplo de Resposta:**
  ```json
  {
    "Custo_de_Disponibilidade": 30,
    "Tipo_de_Instalacao": "Monofasico",
    "consumo": "836,06",
    "injetado": "806,06",
    "mes_ref": "01/01/2023",
    "saldo": "0,00",
    "uc": "10030001",
    "usina": "Usina_W"
  }
  ```

#### **Filtrar Dados de Consumo da IA**
- **Endpoint:** `/api/dados_consumo_ia/filter`
- **Método:** `GET`
- **Descrição:** Filtra os dados de consumo previstos pela IA.
- **Exemplo de Resposta:**
  ```json
  {
    "consumo_previsao": 492.9715881347656,
    "mes_ref_previsao": "2025-01-01",
    "uc": "10010001"
  }
  ```
  
#### **Filtrar Dados de Consumo**
- **Endpoint:** `/api/dados_consumo/filter`
- **Método:** `GET`
- **Descrição:** Filtra os dados de consumo por UC, usina, e mês.
- **Exemplo de Resposta:**
  ```json
  {
    "Custo_de_Disponibilidade": 30,
    "Tipo_de_Instalacao": "Monofásico",
    "consumo": 836.06,
    "injetado": 806.06,
    "mes_ref": "2023-01-01",
    "saldo": 0.0,
    "uc": "10030001",
    "usina": "Usina_W"
  }
  ```
## Licença

Este projeto está licenciado sob uma Licença de Software Comercial. O uso deste software é oferecido sob pagamento e não pode ser redistribuído sem permissão.