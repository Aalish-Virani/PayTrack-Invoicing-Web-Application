import { useState, useEffect } from "react";
import useAuth from "../useAuth/useAuth";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext";

const useFetchInvoices = (invoiceId) => {
  const refreshFlag = useInvoiceForm().isInvoiceFormVisible();

  const { userLoggedIn } = useAuth();
  const userId = userLoggedIn();

  const port = 5173;
  const apiUrl = `http://localhost:${port}/invoiceDetails/${userId}/${invoiceId}`;

  const [invoice, setInvoice] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedInvoice = await response.json();
        setInvoice(fetchedInvoice);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [invoiceId, refreshFlag]);

  return { invoice, isLoading, error };
};

export default useFetchInvoices;
