import { useState, useCallback } from 'react';

/**
 * 컨텍스트 메뉴 상태와 핸들러를 제공하는 커스텀 훅
 */
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState(null);

  // 컨텍스트 메뉴 열기
  const handleContextMenu = useCallback(
    (event, index) => {
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
    },
    [contextMenu],
  );

  // 컨텍스트 메뉴 닫기
  const handleClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    handleContextMenu,
    handleClose,
  };
};
