import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { GlobalContextProvider } from "../context/global-context";
import { theme } from "../utils/theme";
import { Toaster } from 'react-hot-toast';
import AuthChecker from './components/layout/AuthChecker';
import ColorSchemeToggle from './components/layout/ColorSchemeToggle';
import { ReduxProvider } from '../redux/provider';
// import StyledComponentsRegistry from "../../libs/styled-comp-registry";
import '@mantine/core/styles.css';
// import '@mantine/dates/styles.css';
//Pages
import Login from './pages/login/Login';
import ReviewOrders from './pages/review-orders/ReviewOrders';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <GlobalContextProvider>
      <MantineProvider theme={theme}>
      <Toaster position="bottom-right" toastOptions={{ duration: 5000, style: { border: "1px solid black" } }} />
      <ColorSchemeToggle />

    <BrowserRouter>
    <AuthChecker>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/review-orders" element={<ReviewOrders />} />
      </Routes>
    </AuthChecker>
    </BrowserRouter>

    </MantineProvider>
    </GlobalContextProvider>
    </ReduxProvider>
  </StrictMode>,
)
