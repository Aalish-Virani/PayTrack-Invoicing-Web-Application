import { useState } from "react";

const useGenerateInvoiceId = () => {
  const [invoiceId, setInvoiceId] = useState("");

  const generateInvoiceId = () => {
    const letters = String.fromCharCode(
      Math.floor(Math.random() * 26) + 65, // First letter (A-Z)
      Math.floor(Math.random() * 26) + 65 // Second letter (A-Z)
    );

    const numbers = String(Math.floor(1000 + Math.random() * 9000)); // 4 digits (1000-9999)

    const newInvoiceId = `${letters}${numbers}`;
    setInvoiceId(newInvoiceId);
    return newInvoiceId;
  };

  return { invoiceId, generateInvoiceId };
};

export default useGenerateInvoiceId;
