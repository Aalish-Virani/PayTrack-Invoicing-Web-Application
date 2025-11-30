import React from "react";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext";
import dayjs from "dayjs";

const InvoiceDetails = () => {
  const { getSelectedInvoice } = useSelectedInvoice();

  const invoice = getSelectedInvoice();

  const dueDate = dayjs(invoice.payment_due).format("DD MMM YYYY");
  const creationDate = dayjs(invoice.created_at).format("DD MMM YYYY");

  return (
    <div className="p-6 grid grid-cols-12 gap-y-6 gap-x-2 sm:gap-y-10 rounded-xl bg-primary-light dark:bg-primary-dark">
      <div className="row-start-1 col-span-full | sm:col-start-1 sm:col-span-6">
        <div className="font-bold text-sm">
          <span className="text-[#7e88c3]">#</span>
          {invoice.invoice_id}
        </div>
        <div>{invoice.project_description}</div>
      </div>

      <div className=" row-start-2 col-span-full | sm:row-start-1 sm:col-end-13 sm:col-span-6 sm:ms-auto">
        <div>{invoice.sender_address.sender_street}</div>
        <div>{invoice.sender_address.sender_city}</div>
        <div>{invoice.sender_address.sender_postcode}</div>
        <div>{invoice.sender_address.sender_country}</div>
      </div>

      <div className="row-start-3 col-start-1 col-span-6 | sm:row-start-2 sm:col-span-3">
        <div>Invoice Date</div>
        <div className="font-bold text-lg py-2">{creationDate}</div>
      </div>

      <div className="row-start-4 col-start-1 col-span-6 | sm:row-start-3 sm:col-span-3">
        <div>Payment Due</div>
        <div className="font-bold text-lg py-2">{dueDate}</div>
      </div>

      <div className="row-start-3 row-span-2 col-start-7 col-end-13 | sm:row-start-2 sm:col-start-4 sm:col-span-5 sm:ms-8">
        <div>Bill To</div>
        <div className="font-bold text-lg py-2">{invoice.client_name}</div>
        <div>
          <div>{invoice.client_address.client_street}</div>
          <div>{invoice.client_address.client_city}</div>
          <div>{invoice.client_address.client_postcode}</div>
          <div>{invoice.client_address.client_country}</div>
        </div>
      </div>

      <div className="row-start-5 row-span-1 col-span-full | sm:row-start-2 sm:col-start-9 sm:col-span-4">
        <div>Send To</div>
        <div className="font-bold text-lg py-2">{invoice.client_email}</div>
      </div>

      <div className="col-span-full grid-rows-subgrid rounded-xl bg-black dark:bg-white bg-opacity-5 dark:bg-opacity-5">
        <div className="px-4 py-4 | xs:px-5 | sm:px-6">
          <div className="flex text-end justify-between">
            <span className="w-7/12 text-start">Item Name</span>
            <span className="w-1/12">Qty</span>
            <span className="w-4/12 sm:w-2/12">Price</span>
            <span className="w-2/12 hidden sm:block">Total</span>
          </div>
          {invoice.items.map((item, index) => (
            <div key={index} className="pt-4 flex text-end justify-between">
              <span className="w-7/12 text-start">{item.item_name}</span>
              <span className="w-1/12">{item.item_quantity}</span>
              <span className="w-4/12 sm:w-2/12">{item.item_price}</span>
              <span className="w-2/12 hidden sm:block">{item.item_total}</span>
            </div>
          ))}
        </div>
        <div className="py-4 px-6 flex justify-between text-white bg-black bg-opacity-85 rounded-b-xl font-bold">
          <span>Total Amount</span>
          <span>
            {invoice.items.reduce((acc, item) => acc + item.item_total, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
