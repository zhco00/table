/* eslint-disable react/prop-types */
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import { format } from 'date-fns';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useState } from 'react';
import userData from '@/components/userData';

const GanttChart = ({ data, collapsedParts }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ROW_HEIGHT = 53;
  const BAR_HEIGHT = 24;
  const CELL_WIDTH = 40; // 각 날짜 셀의 너비
  const CHECKBOX_WIDTH = 42; // 체크박스 칸 너비

  // 전체 프로젝트 기간 계산
  const startDates = data.map((item) => new Date(item.StartDate));
  const endDates = data.map((item) => new Date(item.DueDate));
  const projectStart = new Date(Math.min(...startDates));
  const projectEnd = new Date(Math.max(...endDates));

  // 날짜 범위에 여유 추가 (시작일 7일 전, 종료일 7일 후까지 표시)
  const extendedStart = new Date(projectStart);
  extendedStart.setDate(extendedStart.getDate());

  const extendedEnd = new Date(projectEnd);
  extendedEnd.setDate(extendedEnd.getDate() + 7);

  // 날짜 눈금 생성
  const getDates = () => {
    const dates = [];
    const current = new Date(extendedStart);

    while (current <= extendedEnd) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = getDates();
  const totalWidth = dates.length * CELL_WIDTH;

  const getBarPosition = (start, end) => {
    const cleanStart = new Date(start);
    cleanStart.setHours(0, 0, 0, 0);

    const cleanEnd = new Date(end);
    cleanEnd.setHours(0, 0, 0, 0);

    const cleanExtendedStart = new Date(extendedStart);
    cleanExtendedStart.setHours(0, 0, 0, 0);

    const startDiff = cleanStart.getTime() - cleanExtendedStart.getTime();
    const startDay = Math.floor(startDiff / (1000 * 60 * 60 * 24));

    const endDiff = cleanEnd.getTime() - cleanStart.getTime();
    const duration = Math.ceil(endDiff / (1000 * 60 * 60 * 24)) + 1;

    return {
      left: `${startDay * CELL_WIDTH}px`,
      width: `${duration * CELL_WIDTH}px`,
    };
  };

  const getEngineerColor = (engineerName) => {
    const user = userData.find((user) => user.Engineer === engineerName);
    return user?.color || '#d9d9d9';
  };

  // 모든 데이터 준비 (숨겨진 행도 포함)
  const prepareAllRows = () => {
    // 각 Part_Group_ID별 첫 번째 행 찾기
    const firstRowsByGroup = {};
    data.forEach((row) => {
      if (row.Part_Group_ID && !firstRowsByGroup[row.Part_Group_ID]) {
        firstRowsByGroup[row.Part_Group_ID] = row.id;
      }
    });

    return data.map((row) => {
      const isRowCollapsed = isCollapsed || false; // 전체 접힘 여부
      const isParentCollapsed = collapsedParts[row.Part_Group_ID]; // 부모가 접혔는지

      // 부모가 접혔을 때 첫 번째 행인지 확인
      const isFirstRowInGroup = row.Part_Group_ID && firstRowsByGroup[row.Part_Group_ID] === row.id;

      return {
        ...row,
        // 부모가 접혔을 때 첫 번째 행이면 표시, 아니면 숨김
        isHidden: isParentCollapsed && !isFirstRowInGroup,
        isCollapsed: isRowCollapsed, // 행이 접힌 상태인지
      };
    });
  };

  const allRows = prepareAllRows();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%', width: '100%' }}>
      <IconButton onClick={() => setIsCollapsed(!isCollapsed)} sx={{ mt: 3.5 }}>
        {isCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      <Paper
        sx={{
          position: 'relative',
          ml: 1,
          flex: 1,
          minHeight: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          width: 'calc(100% - 48px)',
        }}
      >
        <Table sx={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow sx={{ height: '56px' }}>
              <TableCell padding="checkbox" sx={{ width: CHECKBOX_WIDTH, padding: 0 }}></TableCell>
              {!isCollapsed && (
                <TableCell
                  sx={{
                    padding: 0,
                    height: '56px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: totalWidth - CHECKBOX_WIDTH,
                  }}
                >
                  <div
                    style={{
                      width: totalWidth - CHECKBOX_WIDTH,
                      display: 'flex',
                      height: '100%',
                      alignItems: 'center',
                    }}
                  >
                    {dates.map((date, i) => (
                      <div
                        key={i}
                        style={{
                          width: `${CELL_WIDTH}px`,
                          borderLeft: '1px solid #eee',
                          fontSize: '10px',
                          padding: '2px',
                          textAlign: 'center',
                        }}
                      >
                        {format(date, 'MM/dd')}
                      </div>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {allRows.map((row) => {
              // 완전히 숨겨진 행은 렌더링하지 않음
              if (row.isHidden) return null;

              const position = getBarPosition(row.StartDate, row.DueDate);
              const color = getEngineerColor(row.Engineer);

              return (
                <TableRow key={row.id} sx={{ height: `${ROW_HEIGHT}px` }}>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      width: CHECKBOX_WIDTH,
                      padding: 0,
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    }}
                  >
                    {/* 체크박스 칸은 항상 표시 */}
                  </TableCell>

                  {!isCollapsed && (
                    <TableCell
                      sx={{
                        padding: 0,
                        position: 'relative',
                        height: `${ROW_HEIGHT}px`,
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        width: totalWidth - CHECKBOX_WIDTH,
                      }}
                    >
                      <div
                        style={{
                          width: totalWidth - CHECKBOX_WIDTH,
                          height: '100%',
                          position: 'relative',
                        }}
                      >
                        <Tooltip
                          title={`${row.Work}
                            시작: ${format(new Date(row.StartDate), 'yyyy-MM-dd')}
                            종료: ${format(new Date(row.DueDate), 'yyyy-MM-dd')}
                            상태: ${row.Status}`}
                          arrow
                          placement="top"
                        >
                          <div
                            style={{
                              position: 'absolute',
                              height: `${BAR_HEIGHT}px`,
                              top: `${(ROW_HEIGHT - BAR_HEIGHT) / 2}px`,
                              backgroundColor: color,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              left: position.left,
                              width: position.width,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          />
                        </Tooltip>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default GanttChart;
