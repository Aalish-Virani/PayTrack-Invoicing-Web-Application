import React from "react";
import plusIcon from "../../assets/icon-plus.svg";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext.jsx";

const NewInvoiceBtn = ({ invoiceFormToggle }) => {
  const { toggleInvoiceFormVisibility } = useInvoiceForm();

  const openInvoiceForm = () => {
    toggleInvoiceFormVisibility();
  };

  return (
    <button
      onClick={openInvoiceForm}
      className="px-2 py-2 flex items-center bg-[#7f5cf8] rounded-3xl | xl:py-2.5"
    >
      <span className="p-2.5 bg-secondary-light rounded-3xl">
        <img src={plusIcon} alt="" />
      </span>
      <span className="hidden | sm:block px-2.5 text-primary-light font-bold text-sm">
        New Invoice
      </span>
      <span className=" px-3 text-primary-light font-bold text-sm | sm:hidden">
        New
      </span>
    </button>
  );
};

export default NewInvoiceBtn;
