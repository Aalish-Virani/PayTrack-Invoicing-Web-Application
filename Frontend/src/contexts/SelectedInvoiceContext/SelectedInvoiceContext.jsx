import React, { createContext, useContext, useState } from "react";
import dayjs from "dayjs";

const SelectedInvoiceContext = createContext();

export const useSelectedInvoice = () => {
  return useContext(SelectedInvoiceContext);
};

export const SelectedInvoiceProvider = ({ children }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [markedAsPaid, setMarkedAsPaid] = useState(false);

  const updateSelectedInvoice = (invoice) => {
    if (invoice == null) {
      setSelectedInvoice(null);
      setMarkedAsPaid(false);
      return;
    }

    setSelectedInvoice(invoice);
  };

  const setSelectedInvoiceStatus = (newStatus) => {
    setSelectedInvoice((prev) => {
      const updatedInvoice = { ...prev, invoice_status: newStatus };
      return updatedInvoice;
    });
  };

  const getSelectedInvoice = () => {
    return selectedInvoice;
  };

  const getSelectedInvoiceStatus = () => {
    return selectedInvoice.invoice_status;
  };

  const setSelectedInvoiceMarkedAsPaid = () => {
    setMarkedAsPaid(true);
  };
  const setSelectedInvoiceMarkedAsPending = () => {
    setMarkedAsPaid(false);
  };

  const isSelectedInvoiceMarkedAsPaid = () => {
    return markedAsPaid;
  };

  const getSelectedInvoiceId = () => {
    return selectedInvoice.invoice_id;
  };

  return (
    <SelectedInvoiceContext.Provider
      value={{
        selectedInvoice,
        updateSelectedInvoice,
        setSelectedInvoiceStatus,
        getSelectedInvoiceStatus,
        setSelectedInvoiceMarkedAsPaid,
        setSelectedInvoiceMarkedAsPending,
        isSelectedInvoiceMarkedAsPaid,
        getSelectedInvoice,
        getSelectedInvoiceId,
      }}
    >
      {children}
    </SelectedInvoiceContext.Provider>
  );
};
