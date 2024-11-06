import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Square.css'; 

const Square = ({ titulo, icone, descricao, descricao2, descricao3, onClickDescricao }) => {
  const handleDescricaoClick = (descricao) => {
    if (onClickDescricao) {
      onClickDescricao(descricao);
    }
  };

  return (
    <div className="ShapeSquare">
      <div className="info">
        <div className="titulo">
          {icone && <FontAwesomeIcon icon={icone} style={{ marginRight: '8px' }} />}
          {titulo}
        </div>
        
        {/* Descrição 1 */}
        {descricao && (
          <div className="descricao" onClick={() => handleDescricaoClick(descricao)}>
            {descricao.icone && <FontAwesomeIcon icon={descricao.icone} style={{ marginRight: '8px' }} />}
            {descricao.texto}
          </div>
        )}
        
        {/* Descrição 2 */}
        {descricao2 && (
          <div className="descricao" onClick={() => handleDescricaoClick(descricao2)}>
            {descricao2.icone && <FontAwesomeIcon icon={descricao2.icone} style={{ marginRight: '8px' }} />}
            {descricao2.texto}
          </div>
        )}
        
        {/* Descrição 3 */}
        {descricao3 && (
          <div className="descricao" onClick={() => handleDescricaoClick(descricao3)}>
            {descricao3.icone && <FontAwesomeIcon icon={descricao3.icone} style={{ marginRight: '8px' }} />}
            {descricao3.texto}
          </div>
        )}
      </div>
    </div>
  );
};

export default Square;