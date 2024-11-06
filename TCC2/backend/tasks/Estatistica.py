import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sqlalchemy import create_engine, text

def obter_dados_banco(engine, query):
    with engine.connect() as connection:
        return pd.read_sql_query(query, connection)

def comparar_consumo():
    engine = create_engine('mysql+pymysql://new_user:new_password@localhost:3306/bdtcc')

    query_dados_reais = """
        SELECT uc, mes_ref, consumo
        FROM dados_consumo
    """

    query_dados_ia = """
        SELECT uc, mes_ref_previsao, consumo_previsao
        FROM dados_consumo_ia
    """

    dados_reais = obter_dados_banco(engine, query_dados_reais)
    dados_ia = obter_dados_banco(engine, query_dados_ia)

    if not dados_reais.empty and not dados_ia.empty:
        # Exibir os dados recebidos
        print("Dados reais:")
        print(dados_reais.head())
        print("\nDados da IA:")
        print(dados_ia.head())

        dados_reais['mes_ref'] = pd.to_datetime(dados_reais['mes_ref'])

        dados_ia['mes_ref_previsao'] = pd.to_datetime(dados_ia['mes_ref_previsao'])

        media_consumo = dados_reais.groupby(dados_reais['mes_ref'].dt.month)['consumo'].mean().reset_index()
        media_consumo.columns = ['mes', 'media_consumo']

        media_previsao = dados_ia.groupby(dados_ia['mes_ref_previsao'].dt.month)['consumo_previsao'].mean().reset_index()
        media_previsao.columns = ['mes', 'media_previsao']

        meses = {1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
                 5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
                 9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'}

        media_consumo['mes'] = media_consumo['mes'].map(meses)
        media_previsao['mes'] = media_previsao['mes'].map(meses)

        df_comparacao = pd.merge(media_consumo, media_previsao, on='mes', how='inner')

        if not df_comparacao.empty:
            # Calcular a correlação entre consumo real e previsão
            correlacao = df_comparacao['media_consumo'].corr(df_comparacao['media_previsao'])
            print(f"\nCorrelação entre consumo real e previsão: {correlacao}")

            # Calcular MAE, RMSE e R²
            mae = mean_absolute_error(df_comparacao['media_consumo'], df_comparacao['media_previsao'])
            rmse = np.sqrt(mean_squared_error(df_comparacao['media_consumo'], df_comparacao['media_previsao']))
            r2 = r2_score(df_comparacao['media_consumo'], df_comparacao['media_previsao'])

            print(f"MAE: {mae}")
            print(f"RMSE: {rmse}")
            print(f"R²: {r2}")

            with engine.connect() as connection:
                connection.execute(text("DELETE FROM comparacao_consumo"))

            df_comparacao['correlacao'] = correlacao
            df_comparacao['mae'] = mae
            df_comparacao['rmse'] = rmse
            df_comparacao['r_squared'] = r2

            df_comparacao.to_sql('comparacao_consumo', con=engine, if_exists='replace', index=False)

            print("Dados substituídos na tabela comparacao_consumo.")
        else:
            print("Não há dados suficientes para comparação.")
    else:
        print("Não foi possível obter os dados.")

comparar_consumo()
