import { TableHead, TableRow, TableCell, Checkbox } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * 테이블 헤더 컴포넌트
 */
const TableHeader = ({ selectedRows, data, setSelectedRows }) => {
  return (
    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
      <TableRow sx={{ height: '56px' }}>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
            checked={data.length > 0 && selectedRows.length === data.length}
            onChange={(event) => {
              setSelectedRows(event.target.checked ? data.map((row) => row.id) : []);
            }}
          />
        </TableCell>
        <TableCell>Part</TableCell>
        <TableCell>Division</TableCell>
        <TableCell>Work</TableCell>
        <TableCell>Engineer</TableCell>
        <TableCell>Start Date</TableCell>
        <TableCell>Due Date</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
  );
};

TableHeader.propTypes = {
  selectedRows: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
};

export default TableHeader;
