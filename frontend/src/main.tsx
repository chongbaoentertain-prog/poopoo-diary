import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { syncEngine } from './sync';

syncEngine?.start();

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
