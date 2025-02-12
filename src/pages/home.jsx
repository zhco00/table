// React imports
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'

// MUI imports
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Container,
  Paper,
  TableContainer,
  Menu,
  MenuItem,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

// Component imports
import tableData from '@/components/dummy';
import DraggableRow from '@/components/draggableRow';
import createCustomHTML5Backend from '@/components/HTML5Backend';

//컴포넌트 분리
const TableHeader = ({ selectedRows, data, setSelectedRows }) => {
  return (
    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
      <TableRow>
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

// 데이터를 받아서 행의 크기을 계산하는 함수
const calculateRowSpans = (data, collapsedParts) => {
  const rowSpans = new Array(data.length).fill(1);
  let partMap = new Map();

  // `Part_Group_ID` 기준으로 그룹핑하여 rowSpan 계산
  data.forEach((row, index) => {
    const groupId = row.Part_Group_ID;
    if (!partMap.has(groupId)) {
      partMap.set(groupId, []);
    }
    partMap.get(groupId).push(index);
  });

  partMap.forEach((indices, groupId) => {
    const isCollapsed = collapsedParts[groupId];

    if (isCollapsed) {
      // 접힌 상태이면 첫 번째 행을 제외한 나머지는 숨김 (-1 처리)
      indices.forEach((idx, i) => {
        rowSpans[idx] = i === 0 ? 1 : -1; // 첫 번째 행은 1, 나머지는 숨김
      });
    } else {
      // 펼쳐진 상태에서는 모든 행을 정상 표시
      indices.forEach((idx, i) => {
        rowSpans[idx] = i === 0 ? indices.length : 0;
      });
    }
  });

  return rowSpans;
};

const generateGroups = (data) => {
  let groupIdCounter = 1;
  let lastPart = null;
  let lastGroupId = null;

  return data.map((row) => {
    if (row.Part !== lastPart) {
      lastGroupId = `group-${groupIdCounter++}`;
      lastPart = row.Part;
    }
    return { ...row, Part_Group_ID: lastGroupId };
  });
};

const Home = () => {
  const [data, setData] = useState(generateGroups(tableData)); // 테이블 데이터
  const [contextMenu, setContextMenu] = useState(null); // 컨텍스트 메뉴 상태
  const [collapsedParts, setCollapsedParts] = useState({}); // 접힌 파트 상태

  const [selectedRows, setSelectedRows] = useState([]); // 선택된 행 상태
  const [mergeModalOpen, setMergeModalOpen] = useState(false); // 병합 모달 상태
  const [mergeTarget, setMergeTarget] = useState(null); // 병합 대상 상태

  const [editingRow, setEditingRow] = useState(null); // 현재 편집 중인 행 ID
  const [editingField, setEditingField] = useState(null); // 현재 편집 중인 필드 이름

  const updateRow = (rowId, updatedValues) => {

    setData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, ...updatedValues } : row)),
    );
  };

  // 행을 이동하는 함수
  const moveRow = (startIndex, endIndex, toIndex) => {
    const updatedData = [...data];
    const rowsToMove = updatedData.splice(startIndex, endIndex - startIndex + 1);
    const targetPart = updatedData[toIndex]?.Part;

    if (targetPart) {
      const targetPartRowCount = updatedData.filter((row) => row.Part === targetPart).length;
      const draggedPartRowCount = rowsToMove.length;

      if (draggedPartRowCount < targetPartRowCount) {
        setMergeTarget({ rowsToMove, targetPart, startIndex, toIndex, updatedData });
        setMergeModalOpen(true);
      } else {
        updatedData.splice(toIndex, 0, ...rowsToMove);
        setData(generateGroups(updatedData));
      }
    } else {
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(generateGroups(updatedData));
    }
  };

  // 병합 확인 처리 함수
  const handleMergeConfirm = () => {
    if (mergeTarget) {
      const { rowsToMove, targetPart, toIndex, updatedData } = mergeTarget;
      rowsToMove.forEach((row) => {
        row.Part = targetPart;
      });
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(generateGroups(updatedData));
      setMergeTarget(null);
      setMergeModalOpen(false);
    }
  };

  // 병합 취소 처리 함수
  const handleMergeCancel = () => {
    if (mergeTarget) {
      const { rowsToMove, toIndex, updatedData } = mergeTarget;
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(generateGroups(updatedData));
      setMergeTarget(null);
      setMergeModalOpen(false);
    }
  };

  // 행 추가 함수
  const addRow = (index) => {
    const newRow = {
      id: data.length + 1,
      Part: 'New Part',
      Division: 'New Division',
      Work: 'New Work',
      Engineer: 'New Engineer',
      StartDate: '2024-12-01',
      DueDate: '2024-12-05',
      Status: 'Pending',
    };

    const updatedData = [...data];
    updatedData.splice(index + 1, 0, newRow);
    setData(generateGroups(updatedData));
    setContextMenu(null);
  };
  // 행 삭제 함수
  const deleteRow = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(generateGroups(updatedData));
    setContextMenu(null);
  };
  const deleteSelectedRows = () => {
    const updatedData = data.filter((row) => !selectedRows.includes(row.id));
    setData(generateGroups(updatedData));
    setSelectedRows([]);
    setContextMenu(null);
  };
  // 컨텍스트 메뉴 핸들러
  const handleContextMenu = (event, index) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            rowIndex: index,
          }
        : null,
    );
  };

  // 컨텍스트 메뉴 닫기 함수
  const handleClose = () => {
    setContextMenu(null);
  };

  // 파트 접기/펼치기 토글 함수
  const togglePartCollapse = (groupId) => {
    setCollapsedParts((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // 행 선택 핸들러
  const handleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // 선택된 행 병합 함수
  const mergeSelectedRows = () => {
    const partValue = data.find((row) => row.id === selectedRows[0]).Part;
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: partValue } : row,
    );
    setData(generateGroups(updatedData));
    setSelectedRows([]);
    setContextMenu(null);
  };

  // 선택된 행 병합 해제 함수
  const unmergeSelectedRows = () => {
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: `${row.Part} ${row.id}` } : row,
    );
    setData(generateGroups(updatedData));
    setSelectedRows([]);
    setContextMenu(null);
  };

  // 행의 크기(span) 계산
  const rowSpans = calculateRowSpans(data, collapsedParts);

  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        <Button
          variant="contained"
          color="primary"
          onClick={() => addRow(data.length - 1)}
          sx={{ marginBottom: '20px' }}
        >
          Add Row
        </Button>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
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
        </TableContainer>
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
          }
        >
          <MenuItem onClick={() => addRow(contextMenu.rowIndex)}>Add Row Below</MenuItem>
          <MenuItem onClick={mergeSelectedRows}>병합</MenuItem>
          <MenuItem onClick={unmergeSelectedRows}>병합 해제</MenuItem>
          <MenuItem onClick={() => deleteRow(contextMenu.rowIndex)}>단일 행 삭제</MenuItem>
          <MenuItem onClick={deleteSelectedRows}>선택된 행 삭제</MenuItem>
        </Menu>

        <Dialog
          open={mergeModalOpen}
          onClose={handleMergeCancel}
          aria-labelledby="merge-dialog-title"
          aria-describedby="merge-dialog-description"
        >
          <DialogTitle id="merge-dialog-title">셀 병합 확인</DialogTitle>
          <DialogContent>
            <DialogContentText id="merge-dialog-description">
              해당 셀을 {mergeTarget?.targetPart}에 병합하시겠습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMergeCancel} color="secondary">
              아니요
            </Button>
            <Button onClick={handleMergeConfirm} color="primary" autoFocus>
              예
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DndProvider>
  );
};

export default Home;
