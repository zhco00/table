// React imports
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// MUI imports
import { Container, Button } from '@mui/material';

// Component imports
import tableData from '@/components/dummy';
import { TableContainer } from '@/components/Table';
import GanttChart from '@/components/GanttChart';
import { MergeDialog } from '@/components/Dialogs';
import { ContextMenu } from '@/components/Menus';

// Hooks imports
import { useTableData } from '@/hooks/useTableData';
import { useContextMenu } from '@/hooks/useContextMenu';

/**
 * 홈 페이지 컴포넌트
 */
const Home = () => {
  // 테이블 데이터 관리를 위한 커스텀 훅 사용
  const {
    data,
    selectedRows,
    setSelectedRows,
    collapsedParts,
    editingRow,
    setEditingRow,
    editingField,
    setEditingField,
    mergeModalOpen,
    mergeTarget,
    rowSpans,
    updateRow,
    moveRow,
    handleMergeConfirm,
    handleMergeCancel,
    addRow,
    deleteRow,
    deleteSelectedRows,
    togglePartCollapse,
    handleSelect,
    mergeSelectedRows,
    unmergeSelectedRows,
  } = useTableData(tableData);

  // 컨텍스트 메뉴 관리를 위한 커스텀 훅 사용
  const { contextMenu, handleContextMenu, handleClose } = useContextMenu();

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth={false}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => addRow(data.length - 1)}
          sx={{ marginBottom: '20px' }}
        >
          Add Row
        </Button>
        <div style={{ display: 'flex' }}>
          <TableContainer
            data={data}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            rowSpans={rowSpans}
            collapsedParts={collapsedParts}
            togglePartCollapse={togglePartCollapse}
            handleSelect={handleSelect}
            handleContextMenu={handleContextMenu}
            moveRow={moveRow}
            updateRow={updateRow}
            editingRow={editingRow}
            setEditingRow={setEditingRow}
            editingField={editingField}
            setEditingField={setEditingField}
          />

          {/* 간트 차트 */}
          <div
            style={{
              flex: '1 1 auto',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
              minWidth: '30%',
            }}
          >
            <GanttChart data={data} collapsedParts={collapsedParts} />
          </div>
        </div>

        {/* 컨텍스트 메뉴 */}
        <ContextMenu
          contextMenu={contextMenu}
          onClose={handleClose}
          onAddRow={addRow}
          onMergeRows={mergeSelectedRows}
          onUnmergeRows={unmergeSelectedRows}
          onDeleteRow={deleteRow}
          onDeleteSelectedRows={deleteSelectedRows}
        />

        {/* 병합 다이얼로그 */}
        <MergeDialog
          open={mergeModalOpen}
          onCancel={handleMergeCancel}
          onConfirm={handleMergeConfirm}
          targetPart={mergeTarget?.targetPart}
        />
      </Container>
    </DndProvider>
  );
};

export default Home;
