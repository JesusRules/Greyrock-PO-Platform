import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
//Pages
import Login from './pages/Login.tsx';
import ReviewOrders from './pages/ReviewOrders.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/review-orders" element={<ReviewOrders />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
