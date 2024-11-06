from flask import Blueprint, jsonify, request, current_app, send_file
from models.RateioConsumo import RateioConsumo
from models.DadosConsumo import DadosConsumo
from models.DadosConsumoIA import DadosConsumoIA
from models.MediasMensais import MediasMensais
from models.PrevisaoConsumo import PrevisaoConsumo
from models.ComparacaoConsumo import ComparacaoConsumo
from models.DadosGeracao import DadosGeracao
from robot.RNN_LSTM import RNN_LSTM
import csv
from collections import defaultdict
from sqlalchemy import cast, Integer, create_engine
from dotenv import load_dotenv
from models import db
import pandas as pd
from decimal import Decimal, InvalidOperation
from datetime import datetime
import requests
from werkzeug.utils import secure_filename
import threading
import logging
import os
from sqlalchemy.exc import SQLAlchemyError

api = Blueprint('api', __name__)



# Mapeamento dos meses
meses = {
    '01': 'janeiro',
    '02': 'fevereiro',
    '03': 'março',
    '04': 'abril',
    '05': 'maio',
    '06': 'junho',
    '07': 'julho',
    '08': 'agosto',
    '09': 'setembro',
    '10': 'outubro',
    '11': 'novembro',
    '12': 'dezembro'
}


@api.route('/upload_csv', methods=['POST'])
def upload_csv():
    file = request.files.get('file')

    if not file:
        return jsonify({'error': 'Nenhum arquivo enviado.'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Tipo de arquivo inválido. Envie um arquivo CSV.'}), 400

    file_name = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

    try:
        file.save(file_path)
        print(f"Arquivo salvo em: {file_path}")

        # Lê o CSV com separador ponto e vírgula
        df = pd.read_csv(file_path, sep=';', encoding='utf-8')
        print("Colunas do DataFrame:", df.columns.tolist())
        print("Dados do DataFrame:", df.head())

        if df.empty:
            return jsonify({'error': 'O arquivo CSV está vazio.'}), 400

        df.columns = df.columns.str.strip()

        required_columns = ['usina', 'uc', 'mes_ref', 'consumo', 'injetado', 'saldo', 'Tipo_de_Instalacao', 'Custo_de_Disponibilidade']
        missing_columns = [col for col in required_columns if col not in df.columns]

        if missing_columns:
            return jsonify({'error': f'Faltam as colunas: {", ".join(missing_columns)}.'}), 400

        df.fillna({
            'saldo': 0.0,
            'Tipo_de_Instalacao': '',
            'Custo_de_Disponibilidade': 0
        }, inplace=True)

        for _, row in df.iterrows():
            if pd.isnull(row['usina']) or pd.isnull(row['uc']):
                continue

            saldo = Decimal(str(row['saldo']).replace(',', '.')) if pd.notnull(row['saldo']) else Decimal('0.0')

            try:
                mes_ref = pd.to_datetime(row['mes_ref'], format='%d/%m/%Y')  # Formato brasileiro
            except ValueError:
                try:
                    mes_ref = pd.to_datetime(row['mes_ref'], format='%Y-%m-%d')  # Formato ISO8601
                except ValueError:
                    return jsonify({'error': f'Data inválida: {row["mes_ref"]}'}), 400

            dados = DadosConsumo(
                usina=row['usina'],
                uc=row['uc'],
                mes_ref=mes_ref,
                consumo=Decimal(row['consumo'].replace(',', '.')) if isinstance(row['consumo'], str) else row['consumo'],
                injetado=Decimal(row['injetado'].replace(',', '.')) if isinstance(row['injetado'], str) else row['injetado'],
                saldo=Decimal(row['saldo'].replace(',', '.')) if isinstance(row['saldo'], str) else saldo,
                Tipo_de_Instalacao=row['Tipo_de_Instalacao'], 
                Custo_de_Disponibilidade=Decimal(row['Custo_de_Disponibilidade']) if pd.notnull(row['Custo_de_Disponibilidade']) else Decimal('0.0')  
            )
            db.session.add(dados)

        db.session.commit()

        return jsonify({'message': 'Arquivo processado e dados inseridos com sucesso!'}), 200

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
        return jsonify({'error': 'Ocorreu um erro ao processar o arquivo.'}), 500


@api.route('/upload_geracao', methods=['POST'])
def upload_geracao():
    if request.method == 'POST':
        try:
            file = request.files.get('file')
            if not file:
                return jsonify({'error': 'Nenhum arquivo enviado!'}), 400

            if not file.filename.endswith('.csv'):
                return jsonify({'error': 'Arquivo deve ser um CSV!'}), 400

            file_name = secure_filename(file.filename)
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)
            file.save(file_path)
            print(f"Arquivo salvo em: {file_path}")

            # Lê o CSV com separador ponto e vírgula
            df = pd.read_csv(file_path, sep=';', encoding='utf-8')
            print("Colunas do DataFrame:", df.columns.tolist())

            if df.empty:
                return jsonify({'error': 'O arquivo CSV está vazio.'}), 400

            df.columns = df.columns.str.strip()

            expected_columns = ['usina', 'mes_ref', 'geracao']
            missing_columns = [col for col in expected_columns if col not in df.columns]

            if missing_columns:
                return jsonify({'error': f'Faltam as colunas: {", ".join(missing_columns)}.'}), 400

            for _, row in df.iterrows():
                print(f"Lendo linha: {row}") 
                
                # Convertendo geracao para float
                try:
                    geracao = float(row['geracao'])
                except ValueError:
                    return jsonify({'error': f'Valor inválido para geracao: {row["geracao"]}'}), 400

                # Tentativa de conversão da data
                try:
                    mes_ref = pd.to_datetime(row['mes_ref'], format='%d/%m/%Y').date()  # Formato brasileiro
                except ValueError:
                    return jsonify({'error': f'Data inválida: {row["mes_ref"]}'}), 400

                nova_geracao = DadosGeracao(
                    usina=row['usina'],
                    mes_ref=mes_ref,
                    geracao=geracao
                )
                db.session.add(nova_geracao)

            db.session.commit()
            return jsonify({'message': 'Dados de geração inseridos com sucesso!'}), 201
        
        except Exception as e:
            print(f"Ocorreu um erro ao inserir dados: {e}")
            return jsonify({'error': 'Ocorreu um erro ao processar o arquivo.'}), 500

@api.route('/dados_consumo', methods=['GET'])
def get_dados_consumo():
    try:
        dados_consumo = DadosConsumo.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404
        
        dados_list = [p.to_dict_db() for p in dados_consumo]
        return jsonify(dados_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@api.route('/dados_consumo/<string:usina>/<string:uc>/<string:mes_ref>', methods=['DELETE'])
def delete_dados_consumoDELET(usina, uc, mes_ref):
    try:
        mes_ref_date = datetime.strptime(mes_ref, '%Y-%m-%d').date()
        
        dados_consumo = DadosConsumo.query.filter_by(usina=usina, uc=uc, mes_ref=mes_ref_date).first()
        
        if not dados_consumo:
            return jsonify({"message": "Dado de consumo não encontrado."}), 404
        
        db.session.delete(dados_consumo)
        db.session.commit()
        
        return jsonify({"message": "Dado de consumo excluído com sucesso."}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

    
@api.route('/dados_consumo/<string:usina>/<string:uc>/<string:mes_ref>', methods=['GET', 'PUT'])
def get_or_update_dados_consumo(usina, uc, mes_ref):
    try:
        mes_ref_date = datetime.strptime(mes_ref, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Formato de data inválido. Use o formato 'YYYY-MM-DD'."}), 400

    if request.method == 'GET':
        try:
            dados = DadosConsumo.query.filter_by(usina=usina, uc=uc, mes_ref=mes_ref_date).first()
            if dados:
                return jsonify(dados.to_dict_db()), 200
            else:
                return jsonify({"message": "Registro não encontrado."}), 404
        except Exception as e:
            print(f"Erro ao buscar dados: {e}")
            return jsonify({'message': str(e)}), 500

    elif request.method == 'PUT':
        data = request.get_json()
        try:
            data.pop('usina', None)
            data.pop('uc', None)
            data.pop('mes_ref', None)

            updated = DadosConsumo.update_record(usina, uc, mes_ref_date, **data)
            if updated:
                return jsonify({"message": "Registro atualizado com sucesso."}), 200
            else:
                return jsonify({"message": "Registro não encontrado."}), 404
        except Exception as e:
            print(f"Erro ao atualizar registro: {e}")
            return jsonify({'message': str(e)}), 500




@api.route('/dados_consumo/<string:usina>/<string:uc>', methods=['DELETE'])
def delete_dados_consumo(usina, uc):
    mes_ref = request.args.get('mes_ref', default=None) 

    try:
        deleted = DadosConsumo.delete_with_confirmation(usina, uc, mes_ref)
        
        if deleted:
            return jsonify({"message": "Registro(s) excluído(s) com sucesso."}), 200
        else:
            return jsonify({"message": "Nenhum registro encontrado para exclusão."}), 404
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

@api.route('/dados_consumo/filter', methods=['GET'])
def filter_dados_consumo():
    usina = request.args.get('usina', '').strip()
    uc = request.args.get('uc', '').strip()
    mes_ref = request.args.get('mes_ref', '').strip()
    order_by = request.args.get('orderBy', 'usina')
    order_direction = request.args.get('orderDirection', 'asc')

    print(f"Filtrando por usina: '{usina}', UC: '{uc}', Mês: '{mes_ref}'") 

    try:
        query = DadosConsumo.query

        if usina:
            usina_list = usina.split(',')  
            query = query.filter(DadosConsumo.usina.in_(usina_list))
        
        if uc:
            uc_list = uc.split(',')  # Divide as UCs por vírgula
            query = query.filter(DadosConsumo.uc.in_(uc_list))

        if mes_ref:
            mes_ref_list = mes_ref.split(',')  
            query = query.filter(DadosConsumo.mes_ref.in_(mes_ref_list))

        # Ordenação
        if order_by == 'usina':
            query = query.order_by(DadosConsumo.usina.asc() if order_direction == 'asc' else DadosConsumo.usina.desc())
        elif order_by == 'uc':
            query = query.order_by(DadosConsumo.uc.asc() if order_direction == 'asc' else DadosConsumo.uc.desc())
        elif order_by == 'mes_ref':
            query = query.order_by(DadosConsumo.mes_ref.asc() if order_direction == 'asc' else DadosConsumo.mes_ref.desc())
        elif order_by == 'consumo':
            query = query.order_by(DadosConsumo.consumo.asc() if order_direction == 'asc' else DadosConsumo.consumo.desc())
        elif order_by == 'injetado':
            query = query.order_by(DadosConsumo.injetado.asc() if order_direction == 'asc' else DadosConsumo.injetado.desc())
        elif order_by == 'saldo':
            query = query.order_by(DadosConsumo.saldo.asc() if order_direction == 'asc' else DadosConsumo.saldo.desc())
        elif order_by == 'Tipo_de_Instalacao':
            query = query.order_by(DadosConsumo.Tipo_de_Instalacao.asc() if order_direction == 'asc' else DadosConsumo.Tipo_de_Instalacao.desc())
        elif order_by == 'Custo_de_Disponibilidade':
            query = query.order_by(DadosConsumo.Custo_de_Disponibilidade.asc() if order_direction == 'asc' else DadosConsumo.Custo_de_Disponibilidade.desc())

        dados = query.all()
        print(f"Dados retornados: {[d.to_dict_db() for d in dados]}")  

        return jsonify([d.to_dict_db() for d in dados]), 200

    except Exception as e:
        print(f"Erro: {str(e)}")  
        return jsonify({'message': str(e)}), 500


@api.route('/dados_consumo_ia/filter', methods=['GET'])
def filter_dados_consumo_ia():
    uc = request.args.get('uc', '').strip()
    mes_ref = request.args.get('mes_ref', '').strip()  
    order_by = request.args.get('orderBy', 'uc')  
    order_direction = request.args.get('orderDirection', 'asc') 

    print(f"Filtrando por UC: '{uc}', Mês: '{mes_ref}'")  

    try:
        query = DadosConsumoIA.query

        if uc:
            uc_list = uc.split(',') 
            query = query.filter(DadosConsumoIA.uc.in_(uc_list))

        if mes_ref:
            mes_ref_list = mes_ref.split(',')  
            query = query.filter(DadosConsumoIA.mes_ref_previsao.in_(mes_ref_list))

        # Ordenação
        if order_by == 'uc':
            query = query.order_by(DadosConsumoIA.uc.asc() if order_direction == 'asc' else DadosConsumoIA.uc.desc())
        elif order_by == 'mes_ref_previsao':
            query = query.order_by(DadosConsumoIA.mes_ref_previsao.asc() if order_direction == 'asc' else DadosConsumoIA.mes_ref_previsao.desc())
        elif order_by == 'consumo_previsao':
            query = query.order_by(DadosConsumoIA.consumo_previsao.asc() if order_direction == 'asc' else DadosConsumoIA.consumo_previsao.desc())

        dados = query.all()
        print(f"Dados retornados: {[d.to_dict_db() for d in dados]}")  

        return jsonify([d.to_dict_db() for d in dados]), 200

    except Exception as e:
        print(f"Erro: {str(e)}")  
        return jsonify({'message': str(e)}), 500



@api.route('/dados_consumo_br', methods=['GET'])
def get_dados_consumo_br():
    try:
        dados_consumo = DadosConsumo.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404
        
        dados_list = [p.to_dict_br() for p in dados_consumo]
        return jsonify(dados_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@api.route('/media_consumo_injetado_mensal', methods=['GET'])
def get_media_consumo_injetado_mensal():
    try:
        dados_consumo = DadosConsumo.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404

        soma_consumo_mensal = defaultdict(float)
        soma_injetado_mensal = defaultdict(float)
        contador_mensal = defaultdict(int)

        for dado in dados_consumo:
            dados_br = dado.to_dict_br()
            consumo = dados_br.get('consumo')
            injetado = dados_br.get('injetado')
            mes_ref = dados_br.get('mes_ref')


            if mes_ref is None:
                continue
            

            mes = mes_ref.split('/')[1]  


            if consumo and consumo.replace(',', '').replace('.', '').isdigit():
                consumo_float = float(consumo.replace(',', '.'))
                soma_consumo_mensal[mes] += consumo_float

            if injetado and injetado.replace(',', '').replace('.', '').isdigit():
                injetado_float = float(injetado.replace(',', '.'))
                soma_injetado_mensal[mes] += injetado_float

            contador_mensal[mes] += 1

        media_mensal = {}
        for mes in soma_consumo_mensal:
            media_consumo = soma_consumo_mensal[mes] / contador_mensal[mes] if contador_mensal[mes] > 0 else 0
            media_injetado = soma_injetado_mensal[mes] / contador_mensal[mes] if contador_mensal[mes] > 0 else 0

            media_mensal[mes] = {
                "media_consumo": f"{media_consumo:.2f}".replace('.', ','),
                "media_injetado": f"{media_injetado:.2f}".replace('.', ',')
            }

        return jsonify(media_mensal), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@api.route('/comparacao_consumo', methods=['GET'])
def get_comparacao_consumo():
    try:
        comparacoes = db.session.query(ComparacaoConsumo).all() 
        if not comparacoes:
            return jsonify({"message": "Nenhum dado de comparação encontrado."}), 404
        
        comparacao_list = [c.to_dict_db() for c in comparacoes]  
        
        return jsonify(comparacao_list), 200
    except Exception as e:
        # Log de erro pode ser útil para depuração
        print(f"Erro ao buscar comparacao_consumo: {e}")
        return jsonify({'message': 'Erro interno do servidor. Tente novamente mais tarde.'}), 500


@api.route('/dados_consumo_ia', methods=['GET'])
def get_dados_consumo_ia():
    try:
        dados_consumo = DadosConsumoIA.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404
        
        dados_list = [p.to_dict_db() for p in dados_consumo]
        return jsonify(dados_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api.route('/dados_consumo_ia_br', methods=['GET'])
def get_dados_consumo_ia_br():
    try:
        dados_consumo = DadosConsumoIA.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404
        
        dados_list = [p.to_dict_br() for p in dados_consumo]
        return jsonify(dados_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

@api.route('/media_consumo_previsao_mensal', methods=['GET'])
def get_media_consumo_previsao_mensal():
    try:
        dados_consumo = DadosConsumoIA.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404

        soma_consumo_mensal = defaultdict(float)
        contador_mensal = defaultdict(int)

        for dado in dados_consumo:
            dados_db = dado.to_dict_db()
            consumo_previsao = dados_db.get('consumo_previsao')
            mes_ref_previsao = dados_db.get('mes_ref_previsao')

            if mes_ref_previsao is None:
                continue
            

            mes = mes_ref_previsao.split('-')[1]  

            if consumo_previsao is not None:
                soma_consumo_mensal[mes] += consumo_previsao
                # Contador de registros por mês
                contador_mensal[mes] += 1

        media_mensal = {}
        for mes in soma_consumo_mensal:
            media_consumo = soma_consumo_mensal[mes] / contador_mensal[mes] if contador_mensal[mes] > 0 else 0

            media_mensal[mes] = {
                "media_consumo_previsao": f"{media_consumo:.2f}".replace('.', ',')  # Formato BR
            }

        return jsonify(media_mensal), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


    # Rota para 'dados_combinados'
@api.route('/dados_combinados', methods=['GET'])
def get_dados_combinados():
    try:
        dados_consumo_ia = DadosConsumoIA.query.all()
        dados_consumo_ia_uc = {p.uc for p in dados_consumo_ia}  

        dados_consumo = DadosConsumo.query.all()
        if not dados_consumo:
            return jsonify({"message": "Nenhum dado de consumo encontrado."}), 404

        if not dados_consumo_ia:
            dados_list = [p.to_dict_db() for p in dados_consumo]
            return jsonify(dados_list), 200

        dados_faltando = [p.to_dict_db() for p in dados_consumo if p.uc not in dados_consumo_ia_uc]

        return jsonify(dados_faltando), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@api.route('/rateio_consumo/filter', methods=['GET'])
def filter_rateio_consumo():
    usina = request.args.get('usina', '').strip()
    uc = request.args.get('uc', '').strip()
    mes = request.args.get('mes', '').strip()  
    order_by = request.args.get('orderBy', 'usina')  
    order_direction = request.args.get('orderDirection', 'asc')  

    print(f"Filtrando por usina: '{usina}', UC: '{uc}', Mês: '{mes}'")  

    try:
        query = RateioConsumo.query

        # Aplicar filtros
        if usina:
            usina_list = usina.split(',')  
            query = query.filter(RateioConsumo.usina.in_(usina_list))

        if uc:
            uc_list = uc.split(',')  
            query = query.filter(RateioConsumo.uc.in_(uc_list))

        if mes:
            mes_list = mes.split(',') 
            query = query.filter(RateioConsumo.mes.in_(mes_list))

        # Aplicar ordenação
        if order_by == 'usina':
            query = query.order_by(RateioConsumo.usina.asc() if order_direction == 'asc' else RateioConsumo.usina.desc())
        elif order_by == 'uc':
            query = query.order_by(RateioConsumo.uc.asc() if order_direction == 'asc' else RateioConsumo.uc.desc())
        elif order_by == 'mes':
            query = query.order_by(RateioConsumo.mes.asc() if order_direction == 'asc' else RateioConsumo.mes.desc())
        elif order_by == 'consumo':
            query = query.order_by(RateioConsumo.consumo.asc() if order_direction == 'asc' else RateioConsumo.consumo.desc())
        elif order_by == 'rateio':
            query = query.order_by(RateioConsumo.rateio.asc() if order_direction == 'asc' else RateioConsumo.rateio.desc())
        elif order_by == 'rateio_saldo':
            query = query.order_by(RateioConsumo.rateio_saldo.asc() if order_direction == 'asc' else RateioConsumo.rateio_saldo.desc())
        elif order_by == 'mes_acaba_saldo':
            query = query.order_by(RateioConsumo.mes_acaba_saldo.asc() if order_direction == 'asc' else RateioConsumo.mes_acaba_saldo.desc())


        dados = query.all()
        print(f"Dados retornados: {[d.to_dict() for d in dados]}")  

        return jsonify([d.to_dict() for d in dados]), 200

    except Exception as e:
        print(f"Erro: {str(e)}")  
        return jsonify({'message': str(e)}), 500


@api.route('/rateio_consumo', methods=['GET'], endpoint='get_rateio_consumo')
def get_rateio_consumo():
    try:
        rateio_consumo = RateioConsumo.query.all()
        if not rateio_consumo:
            return jsonify({"message": "Nenhum dado de rateio de consumo encontrado."}), 404
        
        rateio_list = [p.to_dict() for p in rateio_consumo]
        return jsonify(rateio_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@api.route('/dados_geracao', methods=['GET'])
def get_dados_geracao():
    try:
        dados_geracao = DadosGeracao.query.all()
        if not dados_geracao:
            return jsonify({"message": "Nenhum dado de geração encontrado."}), 404
        
        dados_list = [p.to_dict() for p in dados_geracao]
        return jsonify(dados_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500