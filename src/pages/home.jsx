/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ItemType = 'ROW';

const tableData = [
  {
    id: 1,
    Part: 'Planning',
    Division: 'Frontend',
    Work: 'UI Design',
    Engineer: 'John Doe',
    StartDate: '2024-12-01',
    DueDate: '2024-12-05',
    Status: 'Completed',
  },
  {
    id: 2,
    Part: 'Development',
    Division: 'Frontend',
    Work: 'Component Development',
    Engineer: 'Jane Smith',
    StartDate: '2024-12-02',
    DueDate: '2024-12-06',
    Status: 'Pending',
  },
  {
    id: 3,
    Part: 'Development',
    Division: 'Backend',
    Work: 'API Integration',
    Engineer: 'Alice Brown',
    StartDate: '2024-12-03',
    DueDate: '2024-12-10',
    Status: 'Pending',
  },
  {
    id: 4,
    Part: 'Testing',
    Division: 'QA',
    Work: 'Functional Testing',
    Engineer: 'Tom Lee',
    StartDate: '2024-12-05',
    DueDate: '2024-12-15',
    Status: 'Completed',
  },
];

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
      const partRowCount = data.filter((r) => r.Part === row.Part).length;
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
}) => {
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

  const [, partRef] = useDrag({
    type: ItemType,
    item: () => {
      const partValue = row.Part;
      let startIndex = index;
      let endIndex = index;

      for (let i = index - 1; i >= 0; i--) {
        if (data[i].Part === partValue) {
          startIndex = i;
        } else {
          break;
        }
      }

      for (let i = index + 1; i < data.length; i++) {
        if (data[i].Part === partValue) {
          endIndex = i;
        } else {
          break;
        }
      }

      return { index, startIndex, endIndex };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.index !== undefined) {
        moveRow(item.startIndex, item.endIndex, dropResult.index);
      }
    },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    drop: () => ({ index }),
  });

  if (isPartCollapsed && partRowSpan === -1) {
    return null;
  }

  return (
    <TableRow
      ref={(node) => ref(drop(node))}
      onContextMenu={(event) => handleContextMenu(event, index)}
    >
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={() => handleSelect(row.id)} />
      </TableCell>
      {partRowSpan > 0 && (
        <TableCell
          ref={partRef}
          rowSpan={partRowSpan}
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {row.Part}
          <IconButton size="small" onClick={() => togglePartCollapse(row.Part)}>
            {isPartCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </TableCell>
      )}
      {partRowSpan === 1 && isPartCollapsed && (
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} colSpan={6} />
      )}
      {!isPartCollapsed && (
        <>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.Division}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.Work}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.Engineer}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.StartDate}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.DueDate}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.Status}
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

// filepath: /C:/dev/table/src/pages/home.jsx
const Home = () => {
  const [data, setData] = useState(tableData);
  const [contextMenu, setContextMenu] = useState(null);
  const [collapsedParts, setCollapsedParts] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState(null);

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

  const handleMergeCancel = () => {
    if (mergeTarget) {
      const { rowsToMove, toIndex, updatedData } = mergeTarget;
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(updatedData);
      setMergeTarget(null);
      setMergeModalOpen(false);
    }
  };

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

  const handleClose = () => {
    setContextMenu(null);
  };

  const togglePartCollapse = (part) => {
    setCollapsedParts((prev) => ({
      ...prev,
      [part]: !prev[part],
    }));
  };

  const handleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const mergeSelectedRows = () => {
    const partValue = data.find((row) => row.id === selectedRows[0]).Part;
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: partValue } : row,
    );
    setData(updatedData);
    setSelectedRows([]);
    setContextMenu(null);
  };

  const unmergeSelectedRows = () => {
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: `${row.Part} ${row.id}` } : row,
    );
    setData(updatedData);
    setSelectedRows([]);
    setContextMenu(null);
  };

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
              해당 셀을 "{mergeTarget?.targetPart}"에 병합하시겠습니까?
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
