/* eslint-disable react/prop-types */

//React Imports
import { useDrag, useDrop } from 'react-dnd';
// MUI imports
import { TableRow, TableCell, Checkbox, IconButton, TextField } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ItemType = 'ROW';

// Part 범위 계산
const calculatePartRange = (index, partValue, data) => {
  let startIndex = index;
  let endIndex = index;

  // 위쪽으로 범위 확장
  for (let i = index - 1; i >= 0; i--) {
    if (data[i].Part === partValue) {
      startIndex = i;
    } else {
      break;
    }
  }

  // 아래쪽으로 범위 확장
  for (let i = index + 1; i < data.length; i++) {
    if (data[i].Part === partValue) {
      endIndex = i;
    } else {
      break;
    }
  }

  return { startIndex, endIndex };
};

const DraggableRow = ({
  row,
  index,
  moveRow,
  handleContextMenu,
  partRowSpan,
  isPartCollapsed,
  togglePartCollapse,
  isSelected,
  handleSelect,
  data,
  updateRow,
  editingRow,
  setEditingRow,
  editingField,
  setEditingField,
}) => {
  const { id, Part, Division, Work, Engineer, StartDate, DueDate, Status } = row;

  // 스타일 상수화
  const cellStyle = { borderBottom: '1px solid rgba(224, 224, 224, 1)' };

  // 드래그 구현
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.index !== undefined) {
        moveRow(item.index, item.index, dropResult.index);
      }
    },
  });

  // 파트별 드래그 구현
  const [, partRef] = useDrag({
    type: ItemType,
    item: () => {
      const { startIndex, endIndex } = calculatePartRange(index, Part, data);
      return { index, startIndex, endIndex };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.index !== undefined) {
        moveRow(item.startIndex, item.endIndex, dropResult.index);
      }
    },
  });

  // 드롭 구현
  const [, drop] = useDrop({
    accept: ItemType,
    drop: () => ({ index }),
  });

  // Part가 접힌 상태에서 렌더링하지 않음
  if (isPartCollapsed && partRowSpan === -1) {
    return null;
  }

  //TextField로 전환하여 값을 수정할 수 있도록 하는 함수
  const renderCell = (field, value) => {
    return editingRow === id && editingField === field ? (
      <TextField
        variant="standard"
        value={value}
        onChange={(e) => updateRow(id, { [field]: e.target.value })}
        onBlur={() => {
          setEditingRow(null);
          setEditingField(null);
        }}
        autoFocus
        fullWidth
      />
    ) : (
      <div
        onClick={() => {
          setEditingRow(id);
          setEditingField(field);
        }}
      >
        {value}
      </div>
    );
  };

  return (
    <TableRow
      ref={(node) => ref(drop(node))}
      onContextMenu={(event) => handleContextMenu(event, index)}
    >
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={() => handleSelect(id)} />
      </TableCell>

      {partRowSpan > 0 && (
        <TableCell ref={partRef} rowSpan={partRowSpan} sx={cellStyle}>
          {Part}
          <IconButton size="small" onClick={() => togglePartCollapse(Part)}>
            {isPartCollapsed ?  <ExpandLessIcon /> :<ExpandMoreIcon />}
          </IconButton>
        </TableCell>
      )}

      {/* 접힌 상태에서 병합된 셀 */}
      {partRowSpan === 1 && isPartCollapsed && <TableCell sx={cellStyle} colSpan={6} />}

      {/* 접히지 않은 상태에서 데이터 렌더링 */}
      {!isPartCollapsed && (
        <>
          <TableCell sx={cellStyle}>{renderCell('Division', Division)}</TableCell>
          <TableCell sx={cellStyle}>{renderCell('Work', Work)}</TableCell>
          <TableCell sx={cellStyle}>{renderCell('Engineer', Engineer)}</TableCell>
          <TableCell sx={cellStyle}>{renderCell('StartDate', StartDate)}</TableCell>
          <TableCell sx={cellStyle}>{renderCell('DueDate', DueDate)}</TableCell>
          <TableCell sx={cellStyle}>{renderCell('Status', Status)}</TableCell>
        </>
      )}
    </TableRow>
  );
};

export default DraggableRow;
