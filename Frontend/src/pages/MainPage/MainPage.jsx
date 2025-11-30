import React, { useEffect, useMemo, useRef, useState } from "react";
import NewInvoiceBtn from "../../components/NewInvoiceBtn/NewInvoiceBtn.jsx";
import InvoiceSummary from "../../components/InvoiceSummary/InvoiceSummary.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../../customHooks/useAuth/useAuth.js";
import InvoiceForm from "../../components/InvoiceForm/InvoiceForm.jsx";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext.jsx";
import useFetchInvoices from "../../customHooks/useFetchInvoices/useFetchInvoices.jsx";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";
import { AnimatePresence, motion } from "framer-motion";

// Filter & Sort Dropdown (same as before)
const FilterSortDropdown = ({ filter, setFilter, sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "draft", label: "Draft" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "dueSoon", label: "Due Date (Soonest)" },
    { value: "dueLate", label: "Due Date (Latest)" },
    { value: "amountHigh", label: "Amount (High to Low)" },
    { value: "amountLow", label: "Amount (Low to High)" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-[#1e2139] rounded-lg shadow-md hover:shadow-lg transition-all font-medium text-sm"
      >
        {filter !== "all" || sortBy !== "newest" ? "Filtered & Sorted" : "Filter & Sort"}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-4 h-4 text-[#7c5dfa]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-64 bg-white dark:bg-[#1e2139] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm mb-3">Filter by Status</h4>
              {statusOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="filter"
                    value={opt.value}
                    checked={filter === opt.value}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-4 h-4 text-[#7c5dfa] focus:ring-[#7c5dfa]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-sm mb-3">Sort By</h4>
              {sortOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={sortBy === opt.value}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-4 h-4 text-[#7c5dfa] focus:ring-[#7c5dfa]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MainPage = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(userLoggedIn());

  // Clear selected invoice when entering main page
  const { updateSelectedInvoice } = useSelectedInvoice();
  useEffect(() => {
    updateSelectedInvoice(null);
  }, [updateSelectedInvoice]);

  // Redirect if not logged in
  useEffect(() => {
    const id = userLoggedIn();
    if (!id) {
      navigate("/user/profile");
    } else {
      setUserId(id);
    }
  }, [userLoggedIn, navigate]);

  const { invoices, isLoading } = useFetchInvoices(userId);
  const { invoiceFormVisible } = useInvoiceForm();

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return [];

    let result = [...invoices];

    if (filter !== "all") {
      result = result.filter(
        (inv) => inv.invoice_status?.toLowerCase() === filter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "dueSoon":
          return new Date(a.payment_due) - new Date(b.payment_due);
        case "dueLate":
          return new Date(b.payment_due) - new Date(a.payment_due);
        case "amountHigh":
          return (b.total || 0) - (a.total || 0);
        case "amountLow":
          return (a.total || 0) - (b.total || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [invoices, filter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#141625] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#7c5dfa]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#141625] transition-colors">
      <section className="max-w-3xl min-h-screen px-3.5 mx-auto py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Invoices
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredAndSortedInvoices.length} invoice{filteredAndSortedInvoices.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <FilterSortDropdown
              filter={filter}
              setFilter={setFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <NewInvoiceBtn />
          </div>
        </div>

        <div className="space-y-4">
          {filteredAndSortedInvoices.length > 0 ? (
            filteredAndSortedInvoices.map((invoice) => (
              <motion.div
                key={invoice.invoice_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-2"
              >
                <InvoiceSummary invoice={invoice} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-32">
              <div className="text-8xl mb-8 text-gray-300 dark:text-gray-700">No Invoices</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {filter === "all" ? "Create your first invoice" : `No ${filter} invoices found`}
              </p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {invoiceFormVisible && <InvoiceForm />}
      </AnimatePresence>
    </div>
  );
};

export default MainPage;