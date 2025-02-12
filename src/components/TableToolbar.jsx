//테이블 조작을 위한 툴바 컴포넌트 생성
//목적: 사용자 인터페이스 개선
const TableToolbar = ({ onAdd, onDelete, onExport, onFilter }) => {
  //필터링, 내보내기 등 기능
  return (
    <Toolbar>
      <Button startIcon={<FilterIcon />} onClick={onFilter}>
        Filter
      </Button>
      <Button startIcon={<ExportIcon />} onClick={onExport}>
        Export
      </Button>
    </Toolbar>
  );
}; 