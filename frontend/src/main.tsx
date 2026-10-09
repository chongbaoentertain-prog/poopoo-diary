import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';
import { syncEngine } from './services/sync';

syncEngine?.start();

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
