import "./resizeObserverShim";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import './scss/style.scss';
import { Provider } from 'react-redux';
import "react-datepicker/dist/react-datepicker.css";
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// Detect refresh
const isRefresh = sessionStorage.getItem('isRefreshed');

if (!isRefresh) {
  // New tab (not a refresh) → clear store
  store.dispatch({ type: 'RESET_STATE' });
  persistor.purge();
}

// Set refresh flag before unload
window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('isRefreshed', 'true');
});

// Clear flag on load to reset it for next session
window.addEventListener('load', () => {
  sessionStorage.removeItem('isRefreshed');
});

// Suppress benign ResizeObserver error from DataTable/datepicker/layout (browser
// quirk when observers deliver notifications across the same frame, e.g. calendar
// month prev/next or unmount/navigation). Use capture so we run before error overlay.
const resizeObserverErr = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/i;
window.addEventListener('error', (e) => {
  if (resizeObserverErr.test(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true; // treat as handled so React overlay doesn't show
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastClassName="custom-toast"
          hideProgressBar={true}
          closeOnClick
          pauseOnHover
          draggable
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
