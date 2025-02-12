export const validateRowData = (row, field) => {
  const errors = {};
  
  if (field === 'StartDate' || field === 'DueDate') {
    if (row.StartDate && row.DueDate) {
      if (new Date(row.StartDate) > new Date(row.DueDate)) {
        errors.dateRange = '시작일이 종료일보다 늦을 수 없습니다.';
      }
    }
  }
  
  return errors;
}; 