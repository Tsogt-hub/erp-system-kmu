import { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface Column {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  format?: (value: any) => string;
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  renderToolbar?: () => React.ReactNode;
}

export default function DataTable({
  title,
  columns,
  data,
  loading = false,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Suchen...',
  renderToolbar,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = searchable
    ? data.filter((row) =>
        columns.some((col) => {
          const value = row[col.id];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {(title || searchable || renderToolbar) && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          {title && (
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
              {title}
            </Typography>
          )}
          {renderToolbar && renderToolbar()}
          {searchable && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ml: 2, minWidth: 250 }}
            />
          )}
        </Toolbar>
      )}
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  Lädt...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {searchTerm ? 'Keine Ergebnisse gefunden' : 'Keine Daten vorhanden'}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => (
                <TableRow
                  hover
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value) : value?.toString() || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}








