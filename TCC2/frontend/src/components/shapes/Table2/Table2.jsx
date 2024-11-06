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
  Autocomplete,
} from '@mui/material';
import { debounce } from 'lodash';
import './Table2.css';
import { useNavigate } from 'react-router-dom';

const Table2 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterEmpresa, setFilterEmpresa] = useState([]);
  const [filterUC, setFilterUC] = useState([]);
  const [filterMesRef, setFilterMesRef] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('empresa');
  const [uniqueEmpresas, setUniqueEmpresas] = useState([]);
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
      setUniqueEmpresas([...new Set(formattedData.map((item) => item.empresa))].sort());
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
      const empresa = filterEmpresa.length > 0 ? filterEmpresa.join(',') : '';
      const uc = filterUC.length > 0 ? filterUC.join(',') : '';
      const mes_ref = filterMesRef.length > 0 ? filterMesRef.join(',') : '';

      const url = `http://127.0.0.1:5000/api/dados_consumo/filter?empresa=${encodeURIComponent(empresa)}&uc=${encodeURIComponent(uc)}&mes_ref=${encodeURIComponent(mes_ref)}&orderBy=${orderBy}&orderDirection=${order}`;
      const response = await fetch(url);
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
  }, [filterEmpresa, filterUC, filterMesRef, orderBy, order]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    fetchDataWithSorting(property, isAsc ? 'desc' : 'asc');
  };

  const handleChangeFilterEmpresa = (event, value) => {
    setFilterEmpresa(value);
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

  const handleEdit = (empresa, uc, mes_ref) => {
    navigate(`/editar/${empresa}/${uc}/${mes_ref}`); // Redireciona com os parâmetros corretos
  };

  const handleDelete = async (empresa, uc, mes_ref) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este item?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/dados_consumo/${empresa}/${uc}/${mes_ref}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o item');
      }

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
      setFilterEmpresa([]);
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
          options={uniqueEmpresas}
          onChange={handleChangeFilterEmpresa}
          className="custom-autocomplete"
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por Empresa" />
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
      </div>

      <TableContainer className="table-margin-top">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'empresa'}
                  direction={orderBy === 'empresa' ? order : 'asc'}
                  onClick={() => handleRequestSort('empresa')}
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
              <TableCell>Consumo (kWh)</TableCell>
              <TableCell>Injetado (kWh)</TableCell>
              <TableCell>Saldo (kWh)</TableCell>
              <TableCell>Custo de Disponibilidade</TableCell>
              <TableCell>Tipo de Instalação</TableCell>
              <TableCell>Mês de Referência</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={`${row.empresa}-${row.uc}-${row.mes_ref}`}>
                <TableCell>{row.empresa}</TableCell>
                <TableCell>{row.uc}</TableCell>
                <TableCell>{row.consumo.toFixed(2)}</TableCell>
                <TableCell>{row.injetado.toFixed(2)}</TableCell>
                <TableCell>{row.saldo.toFixed(2)}</TableCell>
                <TableCell>{row.Custo_de_Disponibilidade.toFixed(2)}</TableCell>
                <TableCell>{row.Tipo_de_Instalacao}</TableCell>
                <TableCell>{row.mes_ref}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(row.empresa, row.uc, row.mes_ref)}>Editar</Button>
                  <Button onClick={() => handleDelete(row.empresa, row.uc, row.mes_ref)}>Excluir</Button>
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

export default Table2;
