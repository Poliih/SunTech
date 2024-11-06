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
  IconButton,
} from '@mui/material';
import { debounce } from 'lodash';
import './TableRateio.css';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';

const TableRateio = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterUsina, setFilterUsina] = useState([]);
  const [filterUC, setFilterUC] = useState([]);
  const [filterMesRef, setFilterMesRef] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('usina');
  const [uniqueUsinas, setUniqueUsinas] = useState([]);
  const [uniqueUCs, setUniqueUCs] = useState([]);
  const [uniqueMesesRef, setUniqueMesesRef] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/rateio_consumo');
      const result = await response.json();
      const formattedData = result.map((item) => ({
        ...item,
        consumo: parseFloat(item.consumo) || 0,
        rateio: parseFloat(item.rateio) || 0,
        rateio_saldo: parseFloat(item.rateio_saldo) || 0,
        mes_acaba_saldo: item.mes_acaba_saldo || '',
      }));

      setData(formattedData);
      setUniqueUsinas([...new Set(formattedData.map((item) => item.usina))].sort());
      setUniqueUCs([...new Set(formattedData.map((item) => item.uc))].sort());
      setUniqueMesesRef([...new Set(formattedData.map((item) => item.mes))].sort());
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
      const usina = filterUsina.length > 0 ? filterUsina.join(',') : '';
      const uc = filterUC.length > 0 ? filterUC.join(',') : '';
      const mes_ref = filterMesRef.length > 0 ? filterMesRef.join(',') : '';

      const url = `http://127.0.0.1:5000/api/rateio_consumo/filter?usina=${encodeURIComponent(usina)}&uc=${encodeURIComponent(uc)}&mes_ref=${encodeURIComponent(mes_ref)}&orderBy=${orderBy}&orderDirection=${order}`;
      const response = await fetch(url);
      const result = await response.json();

      console.log("Dados retornados:", result);

      const formattedData = result.map((item) => ({
        ...item,
        consumo: parseFloat(item.consumo) || 0,
        rateio: parseFloat(item.rateio) || 0,
        rateio_saldo: parseFloat(item.rateio_saldo) || 0,
        mes_acaba_saldo: item.mes_acaba_saldo || '',
      }));
      setData(formattedData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [filterUsina, filterUC, filterMesRef, orderBy, order]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    fetchDataWithSorting(property, isAsc ? 'desc' : 'asc');
  };

  const handleChangeFilterUsina = (event, value) => {
    setFilterUsina(value);
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

  const fetchDataWithSorting = debounce(async (orderBy, orderDirection) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/rateio_consumo/filter?orderBy=${orderBy}&orderDirection=${orderDirection}`);
      const result = await response.json();
      const formattedData = result.map((item) => ({
        ...item,
        consumo: parseFloat(item.consumo) || 0,
        rateio: parseFloat(item.rateio) || 0,
        rateio_saldo: parseFloat(item.rateio_saldo) || 0,
        mes_acaba_saldo: item.mes_acaba_saldo || '',
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
      setFilterUsina([]);
      setFilterUC([]);
      setFilterMesRef([]);
      fetchData();
    }
  };

  const downloadCSV = () => {
    const csvRows = [
      ['Usina', 'UC', 'Mês', 'Consumo', 'Rateio', 'Rateio Saldo', 'Mês Acaba Saldo'],
      ...data.map(row => [
        row.usina,
        row.uc,
        row.mes,
        row.consumo.toFixed(2).replace('.', ','),
        row.rateio.toFixed(2).replace('.', ','),
        row.rateio_saldo.toFixed(2).replace('.', ','),
        row.mes_acaba_saldo,
      ]),
    ];
  

    const csvContent = csvRows.map(e => e.join(';')).join('\n');
  

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rateio_consumo.csv';
    link.click();
  };
  

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Paper className="table-paper">
      <div className="filter-controls table-filters">
        <Autocomplete
          multiple
          options={uniqueUsinas}
          onChange={handleChangeFilterUsina}
          className="custom-autocomplete"
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por Usina" />
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
                  active={orderBy === 'mes'}
                  direction={orderBy === 'mes' ? order : 'asc'}
                  onClick={() => handleRequestSort('mes')}
                >
                  Mês
                </TableSortLabel>
              </TableCell>
              <TableCell align="left">Consumo</TableCell>
              <TableCell align="left">Rateio</TableCell>
              <TableCell align="left">Rateio Saldo</TableCell>
              <TableCell>Mês Acaba Saldo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.usina}</TableCell>
                <TableCell>{row.uc}</TableCell>
                <TableCell>{row.mes}</TableCell>
                <TableCell align="left">{row.consumo.toFixed(2)}</TableCell>
                <TableCell align="left">{row.rateio.toFixed(2)}</TableCell>
                <TableCell align="left">{row.rateio_saldo.toFixed(2)}</TableCell>
                <TableCell>{row.mes_acaba_saldo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TableRateio;
