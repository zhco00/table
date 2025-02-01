import { HTML5Backend } from 'react-dnd-html5-backend';

const createCustomHTML5Backend = (manager) => {
  const backend = new HTML5Backend(manager);

  const originalHandleTopMoveCapture = backend.handleTopMoveCapture.bind(backend);

  backend.handleTopMoveCapture = (e) => {
    originalHandleTopMoveCapture(e);

    const { clientY } = e;
    const { innerHeight } = window;

    const scrollSpeed = 100; // 스크롤 속도를 높임
    const scrollZoneHeight = 200; // 스크롤 범위를 높임

    if (clientY < scrollZoneHeight) {
      window.scrollBy(0, -scrollSpeed);
    } else if (clientY > innerHeight - scrollZoneHeight) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  return backend;
};

export default createCustomHTML5Backend;
