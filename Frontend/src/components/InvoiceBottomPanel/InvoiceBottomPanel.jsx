import React from "react";
import EditInvoiceBtn from "../EditInvoiceBtn/EditInvoiceBtn";
import DeleteInvoiceBtn from "../DeleteInvoiceBtn/DeleteInvoiceBtn";
import MarkAsPaidBtn from "../MarkAsPaidBtn/MarkAsPaidBtn";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext";

const InvoiceBottomPanel = () => {
  const { getSelectedInvoice } = useSelectedInvoice();

  const invoice = getSelectedInvoice();

  const status = invoice.invoice_status;

  const id = invoice.invoice_id;

  return (
    <div className="flex flex-wrap md:hidden py-6 px-8 rounded-xl justify-center items-center gap-3 bg-primary-light dark:bg-primary-dark">
      <EditInvoiceBtn />
      <DeleteInvoiceBtn />
      <MarkAsPaidBtn status={status} invoiceId={id} />
    </div>
  );
};

export default InvoiceBottomPanel;
