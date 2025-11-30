import React from "react";
import StatusLabel from "../StatusLabel/StatusLabel.jsx";
import openBtn from "../../assets/icon-arrow-right.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const InvoiceSummary = ({ invoice }) => {
  const navigate = useNavigate();

  const invoiceId = invoice.invoice_id;

  const paymentDue =
    invoice.payment_due === null
      ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
      : dayjs(invoice.payment_due).format("DD MMM YYYY");

  const clientName = invoice.client_name;
  const invoiceStatus = invoice.invoice_status;
  const invoiceTotal = invoice.total;

  const openInvoiceDetails = () => {
    navigate(`/invoice/${invoiceId}`);
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      openInvoiceDetails();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.5 }}
      animate={{ opacity: 1, scaleY: 1 }}
      // transition={{duration:0.1}}
      whileHover={{ scale: 1.1, boxShadow: "0px 0px 16px rgba(0, 0, 0, .2)" }}
      whileFocus={{ scale: 1.1, boxShadow: "0px 0px 16px rgba(0, 0, 0, .2)" }}
      whileTap={{ scale: 1 }}
      onClick={openInvoiceDetails}
      onKeyDown={handleEnterKey}
      className="grid items-center rounded-xl  bg-primary-light dark:bg-primary-dark cursor-pointer focus:outline-none | grid-cols-2 p-6 gap-y-4 | xs:py-7 xs:px-10 xs:gap-y-6 |  sm:flex sm:justify-evenly sm:px-0 sm:text-center | md:py-7 "
    >
      {/* id */}
      <span className=" | font-bold text-sm  | sm:order-1 sm:w-fit ">
        <span className="text-[#7e88c3]">#</span>
        {invoiceId}
      </span>

      {/* client name */}
      <span className=" font-semibold pe-2  | text-sm text-end | sm:order-3 sm:pe-0  sm:min-w-28 sm:max-w-32 sm:text-center  ">
        {clientName}
      </span>

      {/* due date & mobile total */}
      <span className="   |   text-sm  | sm:order-2 sm:w-fit">
        <div>
          <span className="sm:hidden md:inline md:ps-1"> Due </span>
          <span dangerouslySetInnerHTML={{ __html: paymentDue }} />
        </div>
        <div className="text-xl font-bold pt-0.5 sm:hidden">
          <span>$</span>
          {invoiceTotal}
        </div>
      </span>

      {/* total */}
      <span className="   hidden |   font-bold text-xl sm:inline-block sm:order-4 sm:min-w-28 sm:max-w-32  ">
        <span>$</span>
        {invoiceTotal}
      </span>

      {/* status */}
      <span className="  justify-self-end |   sm:order-5 sm:w-fit sm:justify-self-center ">
        <StatusLabel status={invoiceStatus} />
      </span>

      {/* open btn */}
      <span className="  | hidden  | md:block md:order-6 md:w-fit">
        <button disabled>
          <img src={openBtn} alt="" />
        </button>
      </span>
    </motion.div>
  );
};

export default InvoiceSummary;
