import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import { MantineProvider } from "@mantine/core";
import { GlobalContextProvider } from "../context/global-context";
import { theme } from "../utils/theme";
//Pages
import { ReduxProvider } from '../redux/provider';
import Login from './pages/login/Login';
import ReviewOrders from './pages/review-orders/ReviewOrders';
import { Toaster } from 'react-hot-toast';
import AuthChecker from './components/layout/AuthChecker';
import ColorSchemeToggle from './components/layout/ColorSchemeToggle';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
    <AuthChecker>
      <GlobalContextProvider>
      <MantineProvider theme={theme}>
      <Toaster position="bottom-right" toastOptions={{ duration: 5000, style: { border: "1px solid black" } }} />
      <ColorSchemeToggle />

    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/review-orders" element={<ReviewOrders />} />
      </Routes>
    </BrowserRouter>

    </MantineProvider>
    </GlobalContextProvider>
    </AuthChecker>
    </ReduxProvider>
  </StrictMode>,
)
