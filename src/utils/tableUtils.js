// 테이블 유틸리티 함수 모음

/**
 * 데이터를 Part 기준으로 그룹화하여 Part_Group_ID를 부여합니다.
 */
export const generateGroups = (data) => {
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

/**
 * 데이터를 받아서 행의 크기를 계산하는 함수
 */
export const calculateRowSpans = (data, collapsedParts) => {
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

/**
 * Part 범위 계산
 */
export const calculatePartRange = (index, partValue, data) => {
  let startIndex = index;
  let endIndex = index;

  // 위쪽으로 범위 확장
  for (let i = index - 1; i >= 0; i--) {
    if (data[i].Part === partValue) {
      startIndex = i;
    } else {
      break;
    }
  }

  // 아래쪽으로 범위 확장
  for (let i = index + 1; i < data.length; i++) {
    if (data[i].Part === partValue) {
      endIndex = i;
    } else {
      break;
    }
  }

  return { startIndex, endIndex };
};
