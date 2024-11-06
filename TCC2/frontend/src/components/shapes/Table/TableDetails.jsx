import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { debounce } from 'lodash';
import './TableDetails.css';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';


const TableDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterusina, setFilterusina] = useState([]);
  const [filterUC, setFilterUC] = useState([]);
  const [filterMesRef, setFilterMesRef] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('usina');
  const [uniqueusinas, setUniqueusinas] = useState([]);
  const [uniqueUCs, setUniqueUCs] = useState([]);
  const [uniqueMesesRef, setUniqueMesesRef] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dados_consumo');
      const result = await response.json();
      const formattedData = result.map((item) => ({
        ...item,
        consumo: parseFloat(item.consumo) || 0,
        injetado: parseFloat(item.injetado) || 0,
        saldo: parseFloat(item.saldo) || 0,
        Custo_de_Disponibilidade: parseFloat(item.Custo_de_Disponibilidade) || 0,
        Tipo_de_Instalacao: item.Tipo_de_Instalacao || '',
        mes_ref: item.mes_ref || '',
      }));

      setData(formattedData);
      setUniqueusinas([...new Set(formattedData.map((item) => item.usina))].sort());
      setUniqueUCs([...new Set(formattedData.map((item) => item.uc))].sort());
      setUniqueMesesRef([...new Set(formattedData.map((item) => item.mes_ref))].sort());
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = useCallback(async () => {
    setLoading(true);
    setPage(0);
    try {
      const usina = filterusina.length > 0 ? filterusina.join(',') : '';
      const uc = filterUC.length > 0 ? filterUC.join(',') : '';
      const mes_ref = filterMesRef.length > 0 ? filterMesRef.join(',') : '';

      const url = `http://127.0.0.1:5000/api/dados_consumo/filter?usina=${encodeURIComponent(usina)}&uc=${encodeURIComponent(uc)}&mes_ref=${encodeURIComponent(mes_ref)}&orderBy=${orderBy}&orderDirection=${order}`;
      const response = await fetch(url);
      const result = await response.json();

      console.log("Dados retornados:", result);

      const formattedData = result.map((item) => ({
        ...item,
        consumo: parseFloat(item.consumo) || 0,
        injetado: parseFloat(item.injetado) || 0,
        saldo: parseFloat(item.saldo) || 0,
        Custo_de_Disponibilidade: parseFloat(item.Custo_de_Disponibilidade) || 0,
        Tipo_de_Instalacao: item.Tipo_de_Instalacao || '',
      }));
      setData(formattedData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [filterusina, filterUC, filterMesRef, orderBy, order]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    fetchDataWithSorting(property, isAsc ? 'desc' : 'asc');
  };

  const downloadCSV = () => {
    const csvRows = [];
    const headers = ['Usina', 'UC', 'Mês de Referência', 'Consumo', 'Injetado', 'Saldo', 'Custo de Disponibilidade', 'Tipo de Instalação'];
    csvRows.push(headers.join(','));
  
    data.forEach(row => {
      const values = [
        row.usina,
        row.uc,
        row.mes_ref,
        row.consumo,
        row.injetado,
        row.saldo,
        row.Custo_de_Disponibilidade,
        row.Tipo_de_Instalacao
      ];
      csvRows.push(values.join(','));
    });
  
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'dados_tabela.csv');
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleChangeFilterusina = (event, value) => {
    setFilterusina(value);
  };

  const handleChangeFilterUC = (event, value) => {
    setFilterUC(value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (usina, uc, mes_ref) => {
    navigate(`/editar/${usina}/${uc}/${mes_ref}`); // Redireciona com os parâmetros corretos
};

const handleDelete = async (usina, uc, mes_ref) => {
  // Confirmar exclusão
  const confirmDelete = window.confirm("Tem certeza que deseja excluir este item?");
  if (!confirmDelete) return;

  try {
      // Fazer requisição DELETE
      const response = await fetch(`http://127.0.0.1:5000/api/dados_consumo/${usina}/${uc}/${mes_ref}`, {
          method: 'DELETE',
      });

      if (!response.ok) {
          throw new Error('Erro ao excluir o item');
      }

      // Atualizar dados após a exclusão
      fetchData(); 
  } catch (error) {
      console.error('Erro ao excluir o item:', error);
      alert('Erro ao excluir o item. Tente novamente.');
  }
};



  const fetchDataWithSorting = debounce(async (orderBy, orderDirection) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/dados_consumo/filter?orderBy=${orderBy}&orderDirection=${orderDirection}`);
      const result = await response.json();
      const formattedData = result.map((item) => ({
        ...item,
        consumo: parseFloat(item.consumo) || 0,
        injetado: parseFloat(item.injetado) || 0,
        saldo: parseFloat(item.saldo) || 0,
        Custo_de_Disponibilidade: parseFloat(item.Custo_de_Disponibilidade) || 0,
        Tipo_de_Instalacao: item.Tipo_de_Instalacao || '',
      }));
      setData(formattedData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, 300);

  const applyFilter = (filterType) => {
    if (filterType === 'filter') {
      fetchFilteredData();
    } else if (filterType === 'remove') {
      setFilterusina([]);
      setFilterUC([]);
      setFilterMesRef([]);
      fetchData();
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Paper className="table-paper">
      <div className="filter-controls table-filters">
        <Autocomplete
          multiple
          options={uniqueusinas}
          onChange={handleChangeFilterusina}
          className="custom-autocomplete"
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por usina" />
          )}
        />
        <Autocomplete
          multiple
          options={uniqueUCs}
          onChange={handleChangeFilterUC}
          className="custom-autocomplete"
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por UC" />
          )}
        />
        <Autocomplete
          multiple
          options={uniqueMesesRef}
          onChange={(event, newValue) => setFilterMesRef(newValue)}
          className="custom-autocomplete"
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por Mês de Referência" />
          )}
        />
      </div>
      <div className="filter-buttons">
        <Button onClick={() => applyFilter('filter')}>Aplicar Filtros</Button>
        <Button onClick={() => applyFilter('remove')}>Remover Filtros</Button>
        <IconButton onClick={downloadCSV}>
          <DownloadIcon />
        </IconButton>

      </div>
      <TableContainer className="table-margin-top">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'usina'}
                  direction={orderBy === 'usina' ? order : 'asc'}
                  onClick={() => handleRequestSort('usina')}
                >
                  Usina
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'uc'}
                  direction={orderBy === 'uc' ? order : 'asc'}
                  onClick={() => handleRequestSort('uc')}
                >
                  UC
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'mes_ref'}
                  direction={orderBy === 'mes_ref' ? order : 'asc'}
                  onClick={() => handleRequestSort('mes_ref')}
                >
                  Mês de Referência
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'consumo'}
                  direction={orderBy === 'consumo' ? order : 'asc'}
                  onClick={() => handleRequestSort('consumo')}
                >
                  Consumo
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'injetado'}
                  direction={orderBy === 'injetado' ? order : 'asc'}
                  onClick={() => handleRequestSort('injetado')}
                >
                  Injetado
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'saldo'}
                  direction={orderBy === 'saldo' ? order : 'asc'}
                  onClick={() => handleRequestSort('saldo')}
                >
                  Saldo
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Custo_de_Disponibilidade'}
                  direction={orderBy === 'Custo_de_Disponibilidade' ? order : 'asc'}
                  onClick={() => handleRequestSort('Custo_de_Disponibilidade')}
                >
                  Custo de Disponibilidade
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Tipo_de_Instalacao'}
                  direction={orderBy === 'Tipo_de_Instalacao' ? order : 'asc'}
                  onClick={() => handleRequestSort('Tipo_de_Instalacao')}
                >
                  Tipo de Instalação
                </TableSortLabel>
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.usina}</TableCell>
                <TableCell>{row.uc}</TableCell>
                <TableCell>{row.mes_ref}</TableCell>
                <TableCell>{row.consumo}</TableCell>
                <TableCell>{row.injetado}</TableCell>
                <TableCell>{row.saldo}</TableCell>
                <TableCell>{row.Custo_de_Disponibilidade}</TableCell>
                <TableCell>{row.Tipo_de_Instalacao}</TableCell>
                <TableCell>
                  <Button className='edit-button' onClick={() => handleEdit(row.usina, row.uc, row.mes_ref)}> Editar</Button>
                  <Button className='delete-button' onClick={() => handleDelete(row.usina, row.uc, row.mes_ref)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TableDetails;
