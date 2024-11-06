import mysql.connector 
from dotenv import load_dotenv
import os


load_dotenv()

db_config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_DATABASE'),
}

def buscar_rateio():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True, buffered=True) 

        check_query = """
            SELECT DISTINCT uc 
            FROM dados_consumo 
            WHERE uc NOT IN (SELECT uc FROM rateio_consumo)
        """
        cursor.execute(check_query)
        unidades_faltantes = cursor.fetchall()

        if unidades_faltantes:
            print(f"Unidades que não estão no rateio_consumo: {[u['uc'] for u in unidades_faltantes]}")
            processar_unidades(cursor, conn) 
        else:
            print("Todas as unidades já estão processadas no rateio_consumo.")

    except mysql.connector.Error as err:
        print(f"Erro: {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def processar_unidades(cursor, conn):  
    query = "SELECT mes_ref_previsao, uc, consumo_previsao FROM dados_consumo_ia ORDER BY mes_ref_previsao, uc"
    cursor.execute(query)

    resultados = cursor.fetchall()

    rateios_por_mes_usina = {}
    for registro in resultados:
        mes = registro['mes_ref_previsao'].date()  
        uc = registro['uc']
        consumo = float(registro['consumo_previsao'])

        cursor.execute("SELECT usina FROM dados_consumo WHERE uc = %s", (uc,))
        usina = cursor.fetchone()
        usina_nome = usina['usina'] if usina else 'Usina Desconhecida'

        if mes not in rateios_por_mes_usina:
            rateios_por_mes_usina[mes] = {}
        if usina_nome not in rateios_por_mes_usina[mes]:
            rateios_por_mes_usina[mes][usina_nome] = {}
        
        rateios_por_mes_usina[mes][usina_nome][uc] = consumo

    insert_query = "INSERT INTO rateio_consumo (Mes, uc, Consumo, Rateio, usina) VALUES (%s, %s, %s, %s, %s)"
    
    for mes, usinas in rateios_por_mes_usina.items():
        for usina, consumos in usinas.items():
            total_consumo_usina = sum(consumos.values())
            rateio_export = []

            for uc, consumo in consumos.items():
                rateio = (consumo * 100) / total_consumo_usina  
                rateio_export.append((mes, uc, consumo, round(rateio, 2), usina))

            total_rateio = sum(rateio for _, _, _, rateio, _ in rateio_export)
            if total_rateio != 100.00:
                ajuste = 100.00 - total_rateio
                unidade_afetada = rateio_export[0][1]
                rateio_export[0] = (rateio_export[0][0], rateio_export[0][1], rateio_export[0][2], round(rateio_export[0][3] + ajuste, 2), rateio_export[0][4])
                
                print(f"Ajuste de {ajuste:.2f}% aplicado na unidade {unidade_afetada} para a usina '{usina}' no mês {mes}.")

            cursor.executemany(insert_query, rateio_export)

    conn.commit()  
    print("Dados de rateio inseridos com sucesso na tabela 'rateio_consumo'.")

if __name__ == "__main__":
    buscar_rateio()
