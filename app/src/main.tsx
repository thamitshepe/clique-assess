import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import 'normalize.css';
import './css/style.css';
import './css/montserrat.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import { register } from './hooks/serviceWorker';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Router>
    <App />
  </Router>
);

register();
