/* eslint-disable react/prop-types */

//React Imports
import { useDrag, useDrop } from 'react-dnd';
import { useState, useRef } from 'react';
// MUI imports
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  TextField,
  InputAdornment,
  Popover,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

//dummyData imports
import userData from '@/components/userData';
import { calculatePartRange } from '@/utils/tableUtils';

const ItemType = 'ROW';

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
  const { id, Part, Part_Group_ID, Division, Work, Engineer, StartDate, DueDate, Status } = row;

  // 스타일 상수화
  const cellStyle = {
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    width: '100px',
    padding: '0 16px', // 패딩 조정
    height: '53px', // 행 높이와 동일하게 설정
  };

  // 공통 셀 스타일 - 편집 모드에서도 일관된 크기를 유지하기 위함
  const cellContentStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    padding: 0, // 패딩 제거
  };

  //임시 상태 추가
  const [tempValue, setTempValue] = useState('');
  const [engineerAnchorEl, setEngineerAnchorEl] = useState(null);

  // 날짜 input refs
  const startDateRef = useRef(null);
  const dueDateRef = useRef(null);

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

  // 엔지니어 팝오버 닫기
  const handleEngineerPopoverClose = () => {
    setEngineerAnchorEl(null);
  };

  // 날짜 변경 핸들러
  const handleDateChange = (field, newDate) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      updateRow(id, { [field]: newDate });
    }
  };

  // 엔지니어 선택 핸들러
  const handleEngineerSelect = (value) => {
    updateRow(id, { Engineer: value });
    handleEngineerPopoverClose();
  };

  // 엔지니어 필드 클릭 핸들러
  const handleEngineerClick = (e, value) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setTempValue(value);
    setEngineerAnchorEl(e.currentTarget);
  };

  // 날짜 필드 클릭 핸들러
  const handleDateFieldClick = (field) => {
    if (field === 'StartDate' && startDateRef.current) {
      startDateRef.current.showPicker();
    } else if (field === 'DueDate' && dueDateRef.current) {
      dueDateRef.current.showPicker();
    }
  };

  const renderSelectBox = (field, value) => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        updateRow(id, { [field]: tempValue });
        setEditingRow(null);
        setEditingField(null);
      }
    };

    return (
      <div style={cellContentStyle}>
        {editingRow === id && editingField === field ? (
          <TextField
            variant="standard"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
              updateRow(id, { [field]: tempValue });
              setEditingRow(null);
              setEditingField(null);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            fullWidth
            margin="none"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon />
                </InputAdornment>
              ),
            }}
            sx={{ margin: 0 }}
          />
        ) : (
          <div
            onClick={(e) => handleEngineerClick(e, value)}
            style={{
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {value}
            <KeyboardArrowDownIcon fontSize="small" style={{ opacity: 0.5 }} />
          </div>
        )}
      </div>
    );
  };

  //TextField로 전환하여 값을 수정할 수 있도록 하는 함수
  const renderCell = (field, value, type) => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        updateRow(id, { [field]: tempValue });
        setEditingRow(null);
        setEditingField(null);
      }
    };

    // 날짜 필드 처리
    if (type === 'date') {
      return (
        <div style={cellContentStyle}>
          <div
            onClick={() => handleDateFieldClick(field)}
            style={{
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {value}
          </div>
          <input
            ref={field === 'StartDate' ? startDateRef : dueDateRef}
            type="date"
            value={value}
            onChange={(e) => handleDateChange(field, e.target.value)}
            style={{
              width: '0',
              height: '0',
              padding: '0',
              border: 'none',
              visibility: 'hidden',
              position: 'absolute',
            }}
          />
        </div>
      );
    }

    return (
      <div style={cellContentStyle}>
        {editingRow === id && editingField === field ? (
          <TextField
            variant="standard"
            value={tempValue}
            type={type}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
              updateRow(id, { [field]: tempValue });
              setEditingRow(null);
              setEditingField(null);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            fullWidth
            margin="none"
            sx={{ margin: 0 }}
          />
        ) : (
          <div
            onClick={() => {
              setEditingRow(id);
              setEditingField(field);
              setTempValue(value);
            }}
            style={{
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {value}
          </div>
        )}
      </div>
    );
  };

  // Part가 접힌 상태에서 렌더링하지 않음
  if (isPartCollapsed && partRowSpan === -1) {
    return null;
  }

  return (
    <>
      <TableRow
        ref={(node) => ref(drop(node))}
        onContextMenu={(event) => handleContextMenu(event, index)}
        hover
        sx={{ height: '53px' }}
      >
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={() => handleSelect(id)} />
        </TableCell>

        {partRowSpan > 0 && (
          <TableCell ref={partRef} rowSpan={partRowSpan} sx={{ ...cellStyle, width: '150px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {renderCell('Part', Part)}
              <IconButton
                size="small"
                onClick={() => {
                  togglePartCollapse(Part_Group_ID);
                }}
              >
                {isPartCollapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </div>
          </TableCell>
        )}

        {/* 접힌 상태에서 병합된 셀 */}
        {partRowSpan === 1 && isPartCollapsed && <TableCell sx={cellStyle} colSpan={6} />}

        {/* 접히지 않은 상태에서 데이터 렌더링 */}
        {!isPartCollapsed && (
          <>
            <TableCell sx={{ ...cellStyle, width: '100px' }}>
              {renderCell('Division', Division)}
            </TableCell>
            <TableCell sx={{ ...cellStyle, width: '200px' }}>{renderCell('Work', Work)}</TableCell>
            <TableCell sx={cellStyle}>{renderSelectBox('Engineer', Engineer)}</TableCell>
            <TableCell sx={{ ...cellStyle }}>
              {renderCell('StartDate', StartDate, 'date')}
            </TableCell>
            <TableCell sx={{ ...cellStyle }}>{renderCell('DueDate', DueDate, 'date')}</TableCell>
            <TableCell sx={cellStyle}>{renderCell('Status', Status)}</TableCell>
          </>
        )}
        {isPartCollapsed && partRowSpan === -1 && (
          <>
            <TableCell sx={{ display: 'none' }} colSpan={6} />
          </>
        )}
      </TableRow>

      {/* 엔지니어 선택용 팝오버 */}
      <Popover
        open={Boolean(engineerAnchorEl)}
        anchorEl={engineerAnchorEl}
        onClose={handleEngineerPopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          },
        }}
      >
        <div style={{ padding: '10px', minWidth: '200px' }}>
          {userData.map((item) => (
            <div
              key={item.Engineer}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '4px',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              onClick={() => handleEngineerSelect(item.Engineer)}
            >
              {item.Engineer}
            </div>
          ))}
        </div>
      </Popover>
    </>
  );
};

export default DraggableRow;
