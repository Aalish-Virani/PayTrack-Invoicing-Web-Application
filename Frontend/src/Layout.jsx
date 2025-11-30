import React from "react";
import { Outlet } from "react-router-dom";
import { InvoiceFormProvider } from "./contexts/InvoiceFormContext/InvoiceFormContext.jsx";
import Header from "./components/Header/Header.jsx";
import { SelectedInvoiceProvider } from "./contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";

const Layout = () => {
  return (
    <div className="bg-secondary-light dark:bg-secondary-dark text-black dark:text-white">
      <Header />
      <SelectedInvoiceProvider>
        <InvoiceFormProvider>
          <Outlet />
        </InvoiceFormProvider>
      </SelectedInvoiceProvider>
    </div>
  );
};

export default Layout;
