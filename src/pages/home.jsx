// React imports
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

// 데이터를 받아서 행의 크기을 계산하는 함수
const calculateRowSpans = (data, collapsedParts) => {
  const rowSpans = [];
  let currentPart = null;
  let spanCount = 1;

  data.forEach((row, index) => {
    if (row.Part !== currentPart) {
      if (spanCount > 0) {
        rowSpans[rowSpans.length - spanCount] = spanCount;
      }
      currentPart = row.Part;

      const isCollapsed = collapsedParts[row.Part];

      const partRowCount = data.filter((r) => r.Part === currentPart).length;

      spanCount = isCollapsed && partRowCount > 1 ? 0 : 1;

      rowSpans.push(isCollapsed && partRowCount > 1 ? -1 : 1);
    } else {
      spanCount++;
      rowSpans.push(collapsedParts[row.Part] ? -1 : 0);
    }
  });

  if (spanCount > 0) {
    rowSpans[rowSpans.length - spanCount] = spanCount;
  }

  return rowSpans;
};

const Home = () => {

  const [data, setData] = useState(tableData); // 테이블 데이터
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
        setData(updatedData);
      }
    } else {
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(updatedData);
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
      setData(updatedData);
      setMergeTarget(null);
      setMergeModalOpen(false);
    }
  };

  // 병합 취소 처리 함수
  const handleMergeCancel = () => {
    if (mergeTarget) {
      const { rowsToMove, toIndex, updatedData } = mergeTarget;
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(updatedData);
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
    setData(updatedData);
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
  const togglePartCollapse = (part) => {
    setCollapsedParts((prev) => ({
      ...prev,
      [part]: !prev[part],
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
    setData(updatedData);
    setSelectedRows([]);
    setContextMenu(null);
  };

  // 선택된 행 병합 해제 함수
  const unmergeSelectedRows = () => {
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: `${row.Part} ${row.id}` } : row,
    );
    setData(updatedData);
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
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedRows(data.map((row) => row.id));
                      } else {
                        setSelectedRows([]);
                      }
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
                  isPartCollapsed={collapsedParts[row.Part]}
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
