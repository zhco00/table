import { useState, useCallback, useMemo } from 'react';
import { generateGroups, calculateRowSpans } from '@/utils/tableUtils';

/**
 * 테이블 데이터와 관련 기능을 제공하는 커스텀 훅
 */
export const useTableData = (initialData) => {
  const [data, setData] = useState(generateGroups(initialData));
  const [selectedRows, setSelectedRows] = useState([]);
  const [collapsedParts, setCollapsedParts] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState(null);

  // 행 업데이트
  const updateRow = useCallback((rowId, updatedValues) => {
    setData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, ...updatedValues } : row)),
    );
  }, []);

  // 행 이동
  const moveRow = useCallback(
    (startIndex, endIndex, toIndex) => {
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
    },
    [data],
  );

  // 병합 확인
  const handleMergeConfirm = useCallback(() => {
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
  }, [mergeTarget]);

  // 병합 취소
  const handleMergeCancel = useCallback(() => {
    if (mergeTarget) {
      const { rowsToMove, toIndex, updatedData } = mergeTarget;
      updatedData.splice(toIndex, 0, ...rowsToMove);
      setData(generateGroups(updatedData));
      setMergeTarget(null);
      setMergeModalOpen(false);
    }
  }, [mergeTarget]);

  // 행 추가
  const addRow = useCallback(
    (index) => {
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
    },
    [data],
  );

  // 행 삭제
  const deleteRow = useCallback(
    (index) => {
      const updatedData = data.filter((_, i) => i !== index);
      setData(generateGroups(updatedData));
    },
    [data],
  );

  // 선택된 행 삭제
  const deleteSelectedRows = useCallback(() => {
    const updatedData = data.filter((row) => !selectedRows.includes(row.id));
    setData(generateGroups(updatedData));
    setSelectedRows([]);
  }, [data, selectedRows]);

  // 파트 접기/펼치기 토글
  const togglePartCollapse = useCallback((groupId) => {
    setCollapsedParts((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // 행 선택
  const handleSelect = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  }, []);

  // 선택된 행 병합
  const mergeSelectedRows = useCallback(() => {
    if (selectedRows.length === 0) return;

    const partValue = data.find((row) => row.id === selectedRows[0]).Part;
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: partValue } : row,
    );
    setData(generateGroups(updatedData));
    setSelectedRows([]);
  }, [data, selectedRows]);

  // 선택된 행 병합 해제
  const unmergeSelectedRows = useCallback(() => {
    const updatedData = data.map((row) =>
      selectedRows.includes(row.id) ? { ...row, Part: `${row.Part} ${row.id}` } : row,
    );
    setData(generateGroups(updatedData));
    setSelectedRows([]);
  }, [data, selectedRows]);

  // 행의 크기(span) 계산 - 성능 최적화를 위해 useMemo 사용
  const rowSpans = useMemo(() => calculateRowSpans(data, collapsedParts), [data, collapsedParts]);

  return {
    data,
    selectedRows,
    setSelectedRows,
    collapsedParts,
    editingRow,
    setEditingRow,
    editingField,
    setEditingField,
    mergeModalOpen,
    setMergeModalOpen,
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
  };
};
