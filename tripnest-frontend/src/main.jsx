import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Backend ko jaagta rakho
const keepAlive = () => {
  fetch('https://tripnest-backend-xcci.onrender.com/api/destinations')
    .catch(() => {});
};
setInterval(keepAlive, 14 * 60 * 1000);
keepAlive(); // Page load hote hi ek baar ping karo

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)