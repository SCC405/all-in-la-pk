import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { SesionProvider } from './context/SesionContext.jsx';
import './styles/main.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
);
