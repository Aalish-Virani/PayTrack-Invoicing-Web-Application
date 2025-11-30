import { useState, useEffect } from "react";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext";

const useFetchInvoices = (userId) => {
  const refreshFlag = useInvoiceForm().isInvoiceFormVisible();

  const port = 5173;
  const apiUrl = `http://localhost:${port}/invoices/${userId}`;

  const [invoices, setInvoices] = useState([]);
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
        const fetchedInvoices = await response.json();
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, refreshFlag]);

  return { invoices, isLoading, error };
};

export default useFetchInvoices;
