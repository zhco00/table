// ** dependencies Imports
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

// ** Router Imports
import App from './App.jsx';
import store from './store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
