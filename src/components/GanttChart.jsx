import { Paper, Tooltip, IconButton } from '@mui/material';
import { format } from 'date-fns';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useState } from 'react';

const GanttChart = ({ data, collapsedParts }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 전체 프로젝트 기간 계산
  const startDates = data.map(item => new Date(item.StartDate));
  const endDates = data.map(item => new Date(item.DueDate));
  const projectStart = new Date(Math.min(...startDates));
  const projectEnd = new Date(Math.max(...endDates));

  // 날짜 눈금 생성
  const getDates = () => {
    const dates = [];
    const current = new Date(projectStart);
    
    while (current <= projectEnd) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = getDates();
  const totalWidth = dates.length * 40; // 각 날짜 칸의 너비

  const getBarPosition = (start, end) => {
    const startDay = Math.floor((new Date(start) - projectStart) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${startDay * 40}px`,
      width: `${duration * 40}px`
    };
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
      <IconButton 
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{ mt: 2 }}
      >
        {isCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {!isCollapsed && (
        <Paper 
          sx={{ 
            position: 'relative',
            ml: 1,
            p: 2,
            flex: 1,
            minHeight: '100%',
            overflow: 'auto hidden'  // 가로 스크롤만 허용
          }}
        >
          <div style={{ 
            width: `${totalWidth}px`,
            minHeight: '100%'
          }}>
            {/* 날짜 눈금 */}
            <div style={{ 
              position: 'sticky', 
              top: 0, 
              height: '40px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              backgroundColor: 'white',
              zIndex: 1
            }}>
              {dates.map((date, i) => (
                <div
                  key={i}
                  style={{
                    width: '40px',
                    borderLeft: '1px solid #eee',
                    fontSize: '10px',
                    padding: '2px'
                  }}
                >
                  {format(date, 'MM/dd')}
                </div>
              ))}
            </div>

            {/* 간트 차트 바 */}
            <div style={{ marginTop: '25px', position: 'relative', minHeight: 'calc(100% - 65px)' }}>
              {data.map((row, index) => {
                if (collapsedParts[row.Part_Group_ID] && index !== 0) return null;

                const position = getBarPosition(row.StartDate, row.DueDate);
                
                return (
                  <Tooltip 
                    key={row.id}
                    title={`${row.Work}
                      시작: ${format(new Date(row.StartDate), 'yyyy-MM-dd')}
                      종료: ${format(new Date(row.DueDate), 'yyyy-MM-dd')}
                      상태: ${row.Status}`}
                    arrow
                  >
                    <div
                      style={{
                        position: 'absolute',
                        height: '20px',
                        top: `${(index * 53)}px`,
                        backgroundColor: row.Status === 'Completed' ? '#4caf50' : '#2196f3',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        left: position.left,
                        width: position.width
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </Paper>
      )}
    </div>
  );
};

export default GanttChart; 