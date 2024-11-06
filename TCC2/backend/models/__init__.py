from flask_sqlalchemy import SQLAlchemy

# Inicializa a instância do SQLAlchemy
db = SQLAlchemy()

# Importa os modelos
from .EstatisticasConsumo import EstatisticasConsumo
from .EstatisticasDetalhadas import EstatisticasDetalhadas
from .MediasMensais import MediasMensais
from .CorrelacaoConsumo import CorrelacaoConsumo
from .DadosAleatorios import DadosAleatorios
from .PrevisaoConsumo import PrevisaoConsumo
from .DadosConsumo import DadosConsumo
from .DadosConsumoIA import DadosConsumoIA
from models.ComparacaoConsumo import ComparacaoConsumo

