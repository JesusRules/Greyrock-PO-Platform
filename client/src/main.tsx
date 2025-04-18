import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
//Pages
import { ReduxProvider } from '@redux/provider';
import Login from './pages/Login/Login';
import ReviewOrders from './pages/ReviewOrders';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/review-orders" element={<ReviewOrders />} />
      </Routes>
    </BrowserRouter>
    </ReduxProvider>
  </StrictMode>,
)
