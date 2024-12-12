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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
}) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      if (draggedItem.index !== index) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <TableRow
      ref={(node) => ref(drop(node))}
      sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
      onContextMenu={(event) => handleContextMenu(event, index)}
    >
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={() => handleSelect(row.id)} />
      </TableCell>
      {partRowSpan > 0 && (
        <TableCell
          rowSpan={partRowSpan}
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {row.Part}
          <IconButton size="small" onClick={() => togglePartCollapse(row.Part)}>
            {isPartCollapsed ?
              <ExpandMoreIcon />
            : <ExpandLessIcon />}
          </IconButton>
        </TableCell>
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

const Home = () => {
  const [data, setData] = useState(tableData);
  const [contextMenu, setContextMenu] = useState(null);
  const [collapsedParts, setCollapsedParts] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const moveRow = (fromIndex, toIndex) => {
    const updatedData = [...data];
    const [movedRow] = updatedData.splice(fromIndex, 1);
    updatedData.splice(toIndex, 0, movedRow);

    // Find all rows with the same Part value and move them together
    const partValue = movedRow.Part;
    const rowsToMove = [
      movedRow,
      ...updatedData.filter((row) => row.Part === partValue),
    ];
    rowsToMove.forEach((row) => {
      const rowIndex = updatedData.indexOf(row);
      if (rowIndex !== -1) {
        updatedData.splice(rowIndex, 1);
      }
    });
    updatedData.splice(toIndex, 0, ...rowsToMove);

    setData(updatedData);
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
      contextMenu === null ?
        {
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
      selectedRows.includes(row.id) ? { ...row, Part: `Part ${row.id}` } : row,
    );
    setData(updatedData);
    setSelectedRows([]);
    setContextMenu(null);
  };

  const calculateRowSpans = (data) => {
    const rowSpans = [];
    let currentPart = null;
    let spanCount = 0;

    data.forEach((row, index) => {
      if (row.Part !== currentPart) {
        if (spanCount > 0) {
          rowSpans[rowSpans.length - spanCount] = spanCount;
        }
        currentPart = row.Part;
        spanCount = 1;
        rowSpans.push(0);
      } else {
        spanCount++;
        rowSpans.push(-1);
      }
    });

    if (spanCount > 0) {
      rowSpans[rowSpans.length - spanCount] = spanCount;
    }

    return rowSpans;
  };

  const rowSpans = calculateRowSpans(data);

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
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < data.length
                    }
                    checked={
                      data.length > 0 && selectedRows.length === data.length
                    }
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
            contextMenu !== null ?
              { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
          }
        >
          <MenuItem onClick={() => addRow(contextMenu.rowIndex)}>
            Add Row Below
          </MenuItem>
          <MenuItem onClick={mergeSelectedRows}>병합</MenuItem>
          <MenuItem onClick={unmergeSelectedRows}>병합 해제</MenuItem>
        </Menu>
      </Container>
    </DndProvider>
  );
};

export default Home;
