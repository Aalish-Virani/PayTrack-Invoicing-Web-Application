import React from "react";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext.jsx";

const EditInvoiceBtn = () => {
  const { toggleInvoiceFormVisibility } = useInvoiceForm();

  const openInvoiceForm = () => {
    toggleInvoiceFormVisibility();
  };

  return (
    <button
      onClick={openInvoiceForm}
      className=" px-5 py-3 rounded-3xl font-bold text-sm  bg-black dark:bg-white bg-opacity-5 dark:bg-opacity-5 hover:bg-opacity-10 hover:dark:bg-opacity-10 "
    >
      Edit
    </button>
  );
};

export default EditInvoiceBtn;
