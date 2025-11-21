import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { GlobalContextProvider } from "../context/global-context";
import { PurchaseOrderProvider } from "../context/po-context";
import { theme } from "../utils/theme";
import AuthChecker from './components/layout/AuthChecker';
import ColorSchemeToggle from './components/layout/ColorSchemeToggle';
import { ReduxProvider } from '../redux/provider';
// import StyledComponentsRegistry from "../../libs/styled-comp-registry";
import '@mantine/core/styles.css';
import Login from './pages/login/Login';
import VendorsPage from './pages/vendors/VendorsPage';
import { Toaster } from '@components/ui/toaster';
import POPage from './pages/purchase-orders/POPage';
import DepartmentsPage from './pages/departments/DepartmentPage';
import UsersPage from './pages/users/UsersPage';
// import '@mantine/dates/styles.css';
//Pages


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <GlobalContextProvider>
      <PurchaseOrderProvider>
      <MantineProvider theme={theme}>
      <ColorSchemeToggle />
      <Toaster />

    <BrowserRouter>
    <AuthChecker>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/purchase-orders" element={<POPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/users" element={<UsersPage />} />
      </Routes>
    </AuthChecker>
    </BrowserRouter>

    </MantineProvider>
    </PurchaseOrderProvider>
    </GlobalContextProvider>
    </ReduxProvider>
  </StrictMode>,
)
