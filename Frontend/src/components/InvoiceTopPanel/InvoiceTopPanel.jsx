import React from "react";
import StatusLabel from "../StatusLabel/StatusLabel";
import EditInvoiceBtn from "../EditInvoiceBtn/EditInvoiceBtn.jsx";
import DeleteInvoiceBtn from "../DeleteInvoiceBtn/DeleteInvoiceBtn.jsx";
import MarkAsPaidBtn from "../MarkAsPaidBtn/MarkAsPaidBtn.jsx";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";

const InvoiceTopPanel = React.memo(() => {
  const { getSelectedInvoice } = useSelectedInvoice();

  const invoice = getSelectedInvoice();
  const status = invoice.invoice_status;
  const id = invoice.invoice_id;

  return (
    <div className=" py-6 px-8 rounded-xl flex justify-between bg-primary-light dark:bg-primary-dark">
      <div className=" w-full flex items-center justify-between gap-6 sm:justify-between | md:w-fit ">
        <span>Status</span>
        <span>
          <StatusLabel status={status} />
        </span>
      </div>
      <div className=" hidden md:flex items-center gap-3">
        <EditInvoiceBtn />
        <DeleteInvoiceBtn />
        <MarkAsPaidBtn invoiceId={id} status={status} />
      </div>
    </div>
  );
});

export default InvoiceTopPanel;
