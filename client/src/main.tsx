import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { GlobalContextProvider } from "../context/global-context";
import { PurchaseOrderProvider } from "../context/po-context";
import { theme } from "../utils/theme";
import { Toaster } from 'react-hot-toast';
import AuthChecker from './components/layout/AuthChecker';
import ColorSchemeToggle from './components/layout/ColorSchemeToggle';
import { ReduxProvider } from '../redux/provider';
// import StyledComponentsRegistry from "../../libs/styled-comp-registry";
import '@mantine/core/styles.css';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
// import '@mantine/dates/styles.css';
//Pages


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <GlobalContextProvider>
      <PurchaseOrderProvider>
      <MantineProvider theme={theme}>
      <Toaster position="bottom-right" toastOptions={{ duration: 5000, style: { border: "1px solid black" } }} />
      <ColorSchemeToggle />

    <BrowserRouter>
    {/* <AuthChecker> */}
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
      </Routes>
    {/* </AuthChecker> */}
    </BrowserRouter>

    </MantineProvider>
    </PurchaseOrderProvider>
    </GlobalContextProvider>
    </ReduxProvider>
  </StrictMode>,
)
