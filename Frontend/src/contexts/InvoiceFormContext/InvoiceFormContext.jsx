import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const InvoiceFormContext = createContext();

export const useInvoiceForm = () => {
  const context = useContext(InvoiceFormContext);
  if (!context) {
    throw new Error(
      "useInvoiceForm must be used within an InvoiceFormProvider"
    );
  }
  return context;
};

export const InvoiceFormProvider = ({ children }) => {
  const [invoiceFormVisible, setInvoiceFormVisible] = useState(false);
  const location = useLocation();

  const toggleInvoiceFormVisibility = () => {
    if (!invoiceFormVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    setInvoiceFormVisible((prev) => !prev);
  };


  const isInvoiceFormVisible = () => {
    if (invoiceFormVisible == true) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (invoiceFormVisible) {
      document.body.style.overflow = "";
      setInvoiceFormVisible(false);
    }
  }, [location]);

  return (
    <InvoiceFormContext.Provider
      value={{
        invoiceFormVisible,
        isInvoiceFormVisible,
        toggleInvoiceFormVisibility,
      }}
    >
      {children}
    </InvoiceFormContext.Provider>
  );
};
