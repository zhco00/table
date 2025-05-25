import { Table, TableBody, Paper, TableContainer as MuiTableContainer } from '@mui/material';
import PropTypes from 'prop-types';
import DraggableRow from './DraggableRow';
import TableHeader from './TableHeader';

/**
 * 테이블 컨테이너 컴포넌트
 */
const TableContainer = ({
  data,
  selectedRows,
  setSelectedRows,
  rowSpans,
  collapsedParts,
  togglePartCollapse,
  handleSelect,
  handleContextMenu,
  moveRow,
  updateRow,
  editingRow,
  setEditingRow,
  editingField,
  setEditingField,
}) => {
  return (
    <MuiTableContainer
      component={Paper}
      sx={{ flex: '0 0 auto', minWidth: '650px', maxWidth: '60%', overflow: 'hidden' }}
    >
      <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
        <TableHeader selectedRows={selectedRows} data={data} setSelectedRows={setSelectedRows} />
        <TableBody>
          {data.map((row, index) => (
            <DraggableRow
              key={row.id}
              row={row}
              index={index}
              data={data}
              moveRow={moveRow}
              handleContextMenu={handleContextMenu}
              partRowSpan={rowSpans[index]}
              isPartCollapsed={collapsedParts[row.Part_Group_ID]}
              togglePartCollapse={togglePartCollapse}
              isSelected={selectedRows.includes(row.id)}
              handleSelect={handleSelect}
              updateRow={updateRow}
              editingRow={editingRow}
              setEditingRow={setEditingRow}
              editingField={editingField}
              setEditingField={setEditingField}
            />
          ))}
        </TableBody>
      </Table>
    </MuiTableContainer>
  );
};

TableContainer.propTypes = {
  data: PropTypes.array.isRequired,
  selectedRows: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  rowSpans: PropTypes.array.isRequired,
  collapsedParts: PropTypes.object.isRequired,
  togglePartCollapse: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  handleContextMenu: PropTypes.func.isRequired,
  moveRow: PropTypes.func.isRequired,
  updateRow: PropTypes.func.isRequired,
  editingRow: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
  setEditingRow: PropTypes.func.isRequired,
  editingField: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  setEditingField: PropTypes.func.isRequired,
};

export default TableContainer;
