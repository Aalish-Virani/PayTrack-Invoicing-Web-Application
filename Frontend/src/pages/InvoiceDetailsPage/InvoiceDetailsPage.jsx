import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackBtn from "../../components/BackBtn/BackBtn";
import InvoiceTopPanel from "../../components/InvoiceTopPanel/InvoiceTopPanel";
import InvoiceDetails from "../../components/InvoiceDetails/InvoiceDetails";
import InvoiceForm from "../../components/InvoiceForm/InvoiceForm.jsx";
import InvoiceBottomPanel from "../../components/InvoiceBottomPanel/InvoiceBottomPanel";
import { useUserContext } from "../../contexts/UserContext/UserContext";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext.jsx";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";
import useFetchInvoiceDetails from "../../customHooks/useFetchInvoiceDetails/useFetchInvoiceDetails.jsx";
import { AnimatePresence } from "framer-motion";

const InvoiceDetailsPage = React.memo(() => {
  const { id } = useParams();

  const { invoiceFormVisible } = useInvoiceForm();

  const { updateSelectedInvoice, getSelectedInvoice } = useSelectedInvoice();

  const { invoice, isLoading, error } = useFetchInvoiceDetails(id);

  if (error || invoice == undefined) {
    console.log("no invoice found!");
  }

  if (isLoading) {
    console.log("finding invoice!");
  }

  if (invoice.length != 0) {
    updateSelectedInvoice(invoice);

    if (getSelectedInvoice() != null) {
      return (
        <section className="max-w-3xl min-h-screen mx-2  px-3.5 py-8 flex flex-col gap-6 | sm:mx-4 | md:mx-auto">
          <div>
            <BackBtn />
          </div>
          <div>
            <InvoiceTopPanel />
          </div>

          <div>
            <InvoiceDetails />
          </div>
          <div>
            <InvoiceBottomPanel />
          </div>
          <AnimatePresence mode="wait">
            {invoiceFormVisible && <InvoiceForm />}
          </AnimatePresence>
        </section>
      );
    }
  }
  // if any error
  return <div className="max-w-3xl min-h-screen"></div>;
});

export default InvoiceDetailsPage;
