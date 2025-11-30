import * as Yup from "yup";

import React, { useEffect, useRef, useState } from "react";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";
import { useUserContext } from "../../contexts/UserContext/UserContext.jsx";
import { useInvoiceForm } from "../../contexts/InvoiceFormContext/InvoiceFormContext.jsx";
import { AnimatePresence, motion } from "framer-motion";
import useGenerateInvoiceId from "../../customHooks/useGenerateInvoiceId/useGenerateInvoiceId.js";
import deleteBtn from "../../assets/icon-delete.svg";
import dayjs from "dayjs";

const InvoiceForm = () => {
  const invoice = useSelectedInvoice().getSelectedInvoice();

  const [invoiceId, setInvoiceId] = useState(null);

  const [isDataSaved, setIsDataSaved] = useState(false);

  const { generateInvoiceId } = useGenerateInvoiceId();

  const userId = useUserContext().getUserId();

  const { toggleInvoiceFormVisibility, isInvoiceFormVisible } =
    useInvoiceForm();

  const [formValues, setFormValues] = useState({
    senderStreet: "",
    senderCity: "",
    senderCountry: "",
    senderPostCode: "",
    clientName: "",
    clientEmail: "",
    createdAt: "",
    paymentTerms: "",
    projectDescription: "",
    clientStreet: "",
    clientCity: "",
    clientCountry: "",
    clientPostCode: "",
    items: [],
  });

  const [items, setItems] = useState([
    { name: "", qty: "", price: "", total: "" },
  ]);

  const [editingInvoice, setEditingInvoice] = useState(false);

  const calculatePaymentDue = (createdAt, paymentTerms) => {
    if (!createdAt || !paymentTerms) return "";

    // THIS IS THE KEY: Convert string to number safely
    const days = parseInt(paymentTerms, 10);

    // If user typed letters or empty → default to 30 days (or show error)
    if (isNaN(days) || days <= 0) {
      return dayjs(createdAt).add(30, "day").format("YYYY-MM-DD"); // fallback
    }

    return dayjs(createdAt).add(days, "day").format("YYYY-MM-DD");
  };

  // const calculatePaymentDue = (createdAt, paymentTerms) => {
  //   if (!createdAt || !paymentTerms) return "";
  //   const days = parseInt(paymentTerms);
  //   return dayjs(createdAt).add(days, "day").format("YYYY-MM-DD");
  // };

  useEffect(() => {
    if (invoice) {
      setEditingInvoice(true);

      setInvoiceId(invoice.invoice_id);

      // date formated
      invoice.created_at = dayjs(invoice.created_at).format("YYYY-MM-DD");

      const invoiceValues = {
        senderStreet: invoice.sender_address.sender_street || "",
        senderCity: invoice.sender_address.sender_city || "",
        senderCountry: invoice.sender_address.sender_country || "",
        senderPostCode: invoice.sender_address.sender_postcode || "",
        clientName: invoice.client_name || "",
        clientEmail: invoice.client_email || "",
        createdAt: invoice.created_at || "",
        paymentTerms: invoice.payment_terms || "",
        projectDescription: invoice.project_description || "",
        clientStreet: invoice.client_address.client_street || "",
        clientCity: invoice.client_address.client_city || "",
        clientCountry: invoice.client_address.client_country || "",
        clientPostCode: invoice.client_address.client_postcode || "",
      };

      const itemsValues =
        invoice.items.length > 0
          ? invoice.items.map((item) => ({
            name: item.item_name || "",
            qty: item.item_quantity || "",
            price: item.item_price || "",
            total: item.item_total || "",
          }))
          : [{ name: "", qty: "", price: "", total: "" }];

      setFormValues((prev) => ({
        ...prev,
        ...invoiceValues,
      }));

      setItems(itemsValues);
    } else {
      setEditingInvoice(false);

      setInvoiceId(generateInvoiceId());

      setFormValues({
        senderStreet: "",
        senderCity: "",
        senderCountry: "",
        senderPostCode: "",
        clientName: "",
        clientEmail: "",
        createdAt: new Date().toISOString().split("T")[0],
        paymentTerms: "",
        projectDescription: "",
        clientStreet: "",
        clientCity: "",
        clientCountry: "",
        clientPostCode: "",
      });

      setItems([{ name: "", qty: "", price: "", total: "" }]);
    }
  }, [isInvoiceFormVisible()]);

  const handleClick = (event) => {
    if (event.target === event.currentTarget) {
      toggleInvoiceFormVisibility();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(e.target);
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", qty: "", price: "", total: "" }]);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  useEffect(() => {
    // Check if data has been saved and hide the form after a delay
    if (isDataSaved) {
      const timeoutId = setTimeout(() => {
        toggleInvoiceFormVisibility();
        setIsDataSaved(false);
      }, 500); // Adjust delay as needed (e.g., 500 milliseconds)

      return () => clearTimeout(timeoutId);
    }
  }, [isDataSaved]);

  const handleInputChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "qty" || field === "price") {
      const qty = parseFloat(newItems[index].qty) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].total = (qty * price).toFixed(2);
    }

    setItems(newItems);
  };

  // ------------------------------------------------------------------------------------------------------------------------------

  const validationSchema = Yup.object({
    senderStreet: Yup.string().max(
      50,
      "Street name cannot exceed 50 characters"
    ),

    senderCity: Yup.string().matches(
      /^[a-zA-Z\s]+$/,
      "City name must contain only letters and spaces"
    ),
    senderCountry: Yup.string().matches(
      /^[a-zA-Z\s]+$/,
      "Country name must contain only letters and spaces"
    ),

    senderPostCode: Yup.string().matches(
      /^[0-9A-Za-z -]{4,10}$/,
      "Invalid postcode format"
    ),

    clientName: Yup.string()
      .max(25, "Client Name cannot exceed 25 characters")
      .matches(
        /^[a-zA-Z\s]+$/,
        "Client Name must contain only letters and spaces"
      )
      .required("Client Name is required"),

    clientEmail: Yup.string()
      .email("Invalid email format")
      .required("email is required"),

    createdAt: Yup.string()
      .max(new Date(), "Date cannot be in the future")
      .required("Creation date is required"),

    paymentTerms: Yup.string()
      .oneOf(["7", "14", "30", "60", "90"], "Invalid payment term") // Assuming only 7, 14, or 30 days are valid options
      .required("Payment terms are required"),
    projectDescription: Yup.string()
      .max(100, "Description must not exceed 100 characters")
      .matches(
        /[a-zA-Z0-9]/,
        "Description must contain at least one letter or number"
      ),

    clientStreet: Yup.string().max(
      50,
      "Street name cannot exceed 50 characters"
    ),

    clientCity: Yup.string().matches(
      /^[a-zA-Z\s]+$/,
      "City name must contain only letters and spaces"
    ),
    clientCountry: Yup.string().matches(
      /^[a-zA-Z\s]+$/,
      "Country name must contain only letters and spaces"
    ),

    clientPostCode: Yup.string().matches(
      /^[0-9A-Za-z -]{4,10}$/,
      "Invalid postcode format"
    ),

    // // items
    name: Yup.string()
      .min(2, "Item name must be at least 2 characters long")
      .max(100, "Item name cannot exceed 100 characters"),

    qty: Yup.number()
      .typeError("Quantity must be a number")
      .integer("Quantity must be a whole number")
      .positive("Quantity must be greater than 0"),

    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be greater than 0"),

    total: Yup.number()
      .typeError("Total must be a number")
      .min(0, "Total must be 0 or greater")
      .required("Total is required"),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Calculate payment due date
    const paymentDueDate = calculatePaymentDue(
      formValues.createdAt,
      formValues.paymentTerms
    );


    // Prepare correct payload that matches backend exactly
    const invoiceData = {
      createdAt: formValues.createdAt,
      paymentDue: paymentDueDate,                    // ← THIS WAS MISSING!
      paymentTerms: parseInt(formValues.paymentTerms),
      projectDescription: formValues.projectDescription,
      clientName: formValues.clientName,
      clientEmail: formValues.clientEmail,

      // Sender address
      senderStreet: formValues.senderStreet,
      senderCity: formValues.senderCity,
      senderPostCode: formValues.senderPostCode,
      senderCountry: formValues.senderCountry,

      // Client address
      clientStreet: formValues.clientStreet,
      clientCity: formValues.clientCity,
      clientPostCode: formValues.clientPostCode,
      clientCountry: formValues.clientCountry,

      // Items – filter out empty rows
      items: items
        .filter(
          (item) =>
            item.name.trim() !== "" ||
            item.qty !== "" ||
            item.price !== ""
        )
        .map((item) => ({
          name: item.name,
          qty: parseInt(item.qty) || 0,
          price: parseFloat(item.price) || 0,
          total: parseFloat(item.total) || 0,
        })),
    };

    const operation = editingInvoice ? "edit" : "create";
    const method = editingInvoice ? "PUT" : "POST";

    try {
      // Simple required field check first (Yup was broken for items)
      if (!formValues.clientName || !formValues.clientEmail || !paymentDueDate) {
        alert("Please fill all required fields");
        return;
      }

      console.log("Sending invoice data:", invoiceData); // ← Check this in browser console!

      const response = await fetch(
        `http://localhost:5173/invoice/${operation}/${userId}/${invoiceId}`,
        {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoiceData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Server error:", result);
        alert("Failed to save: " + (result.error || result.message || "Unknown error"));
        return;
      }

      console.log("Invoice saved successfully!", result);
      setIsDataSaved(true);

    } catch (error) {
      console.error("Submit error:", error);
      alert("Network or validation error. Check console.");
    }
  };

  // ------------------------------------------------------------------------------------------------------------------------------

  const bgRef = useRef(null);
  const formRef = useRef(null);

  //  close if user press escape key

  useEffect(() => {
    if (isInvoiceFormVisible()) {
      const timeout = setTimeout(() => {
        if (formRef.current) {
          formRef.current.focus();
        }
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [isInvoiceFormVisible()]);

  const handleKeyDown = (event) => {
    if (isInvoiceFormVisible() && event.key === "Escape") {
      toggleInvoiceFormVisibility();
    }
  };

  // close form if clicked outside

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bgRef.current &&
        bgRef.current.contains(event.target) &&
        !formRef.current.contains(event.target)
      ) {
        if (isInvoiceFormVisible()) {
          toggleInvoiceFormVisibility();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isInvoiceFormVisible()]);

  // -------------------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------------------
  return (
    <motion.div
      className={"fixed inset-0 overflow-hidden bg-black bg-opacity-85"}
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.3,
          delay: 0.1,
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.3,
          delay: 0.1,
        },
      }}
      onClick={handleClick}
      tabIndex={0}
      ref={bgRef}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{
          x: "0%",
          transition: {
            type: "spring",
            stiffness: 90,
            damping: 17.5,
            duration: 0.4,
          },
        }}
        exit={{
          x: "-100%",
          transition: {
            type: "spring",
            stiffness: 90,
            damping: 17.5,
            duration: 0.4,
          },
        }}
        className=" ms-20 h-full overflow-hidden flex"
      >
        <div
          className="overflow-y-scroll bg-primary-light dark:bg-secondary-dark"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          ref={formRef}
        >
          <form
            className={`max-w-2xl px-12 py-10 flex flex-col gap-y-4 `}
            onSubmit={handleSubmit}
            method="post"
          >
            <h2 className="flex font-bold text-3xl">
              <span className={`${editingInvoice ? "hidden" : "block"}`}>
                Invoice
              </span>
              <span className={`${editingInvoice ? "block" : "hidden"}`}>
                Edit
              </span>
              <pre className="text-[#4a4082]"> #</pre>
              {invoiceId}
            </h2>

            {/* bill from */}
            <section>
              <div>
                <h2 className="text-[#4a4082] font-bold">Bill From</h2>
              </div>
              <div className="flex flex-col py-2">
                <label
                  className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                  htmlFor="senderStreet"
                >
                  Sender Address
                </label>
                <input
                  className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                  type="text"
                  name="senderStreet"
                  id="senderStreet"
                  value={formValues.senderStreet}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-wrap justify-between gap-x-4">
                <span className="flex-auto flex flex-col md:max-w-44">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75 "
                    htmlFor="senderCity"
                  >
                    City
                  </label>
                  <input
                    className=" bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md w-full my-1 px-2 pt-2 pb-2.5 "
                    type="text"
                    name="senderCity"
                    id="senderCity"
                    value={formValues.senderCity}
                    onChange={handleChange}
                  />
                </span>
                <span className="flex-auto flex flex-col md:max-w-44">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75 "
                    htmlFor="senderPostCode"
                  >
                    Post Code
                  </label>
                  <input
                    className=" bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md w-full my-1 px-2 pt-2 pb-2.5 "
                    type="text"
                    name="senderPostCode"
                    id="senderPostCode"
                    value={formValues.senderPostCode}
                    onChange={handleChange}
                  />
                </span>
                <span className="flex-auto flex flex-col md:max-w-44">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75 "
                    htmlFor="senderCountry"
                  >
                    Country
                  </label>
                  <input
                    className=" bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md w-full my-1 px-2 pt-2 pb-2.5 "
                    type="text"
                    name="senderCountry"
                    id="senderCountry"
                    value={formValues.senderCountry}
                    onChange={handleChange}
                  />
                </span>
              </div>
            </section>

            {/* bill to */}
            <section>
              <div>
                <h2 className="text-[#4a4082] font-bold">Bill To</h2>
              </div>
              <div className="flex flex-col py-2">
                <label
                  className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                  htmlFor="clientName"
                >
                  Client Name
                </label>
                <input
                  className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                  type="text"
                  name="clientName"
                  id="clientName"
                  value={formValues.clientName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col py-2">
                <label
                  className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                  htmlFor="clientEmail"
                >
                  Client Email
                </label>
                <input
                  className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                  type="email"
                  name="clientEmail"
                  id="clientEmail"
                  placeholder="e.g. alex@example.com"
                  value={formValues.clientEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col py-2">
                <label
                  className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                  htmlFor="clientStreet"
                >
                  Client Address
                </label>
                <input
                  className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                  type="text"
                  name="clientStreet"
                  id="clientStreet"
                  value={formValues.clientStreet}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-wrap justify-between gap-x-4">
                <span className="flex-auto flex flex-col md:max-w-44">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75 "
                    htmlFor="clientCity"
                  >
                    City
                  </label>
                  <input
                    className=" bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md w-full my-1 px-2 pt-2 pb-2.5 "
                    type="text"
                    name="clientCity"
                    id="clientCity"
                    value={formValues.clientCity}
                    onChange={handleChange}
                  />
                </span>
                <span className="flex-auto flex flex-col md:max-w-44">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75 "
                    htmlFor="clientPostCode"
                  >
                    Post Code
                  </label>
                  <input
                    className=" bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md w-full my-1 px-2 pt-2 pb-2.5 "
                    type="text"
                    name="clientPostCode"
                    id="clientPostCode"
                    value={formValues.clientPostCode}
                    onChange={handleChange}
                  />
                </span>
                <span className="flex-auto flex flex-col md:max-w-44">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75 "
                    htmlFor="clientCountry"
                  >
                    Country
                  </label>
                  <input
                    className=" bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md w-full my-1 px-2 pt-2 pb-2.5 "
                    type="text"
                    name="clientCountry"
                    id="clientCountry"
                    value={formValues.clientCountry}
                    onChange={handleChange}
                  />
                </span>
              </div>
            </section>

            {/* project */}
            <section>
              <div className="flex flex-wrap justify-between gap-x-4">
                <span className="flex flex-col py-2 basis-full xs:basis-[47.5%] sm:basis-[48%]">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                    htmlFor="createdAt"
                  >
                    Created At
                  </label>
                  <input
                    className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                    type="date"
                    name="createdAt"
                    id="createdAt"
                    value={formValues.createdAt}
                    onChange={handleChange}
                  />
                </span>
                <span className="flex flex-col py-2 basis-full xs:basis-[47.5%] sm:basis-[48%]">
                  <label
                    className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                    htmlFor="paymentTerms"
                  >
                    Payment Terms
                  </label>
                  <select
                    name="paymentTerms"
                    value={formValues.paymentTerms}
                    onChange={handleChange}
                    className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold   outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2.5 pb-3"
                    required
                  >
                    <option value="">Select payment terms</option>
                    {/* <option value="1">Next 1 Day</option> */}
                    <option value="7">Next 7 Days</option>
                    <option value="14">Next 14 Days</option>
                    <option value="30">Next 30 Days</option>
                    <option value="60">Next 60 Days</option>
                    <option value="90">Next 90 Days</option>
                  </select>

                  {/* <input
                    className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                    type="number"
                    name="paymentTerms"
                    id="paymentTerms"
                    value={formValues.paymentTerms}
                    onChange={handleChange}
                  /> */}
                </span>
              </div>
              <div className="flex flex-col py-2">
                <label
                  className="text-black text-opacity-75 dark:text-white dark:text-opacity-75"
                  htmlFor="ProjectDescription"
                >
                  Project Description
                </label>
                <input
                  className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md  my-1 px-2 pt-2 pb-2.5"
                  type="text"
                  name="projectDescription"
                  id="projectDescription"
                  value={formValues.projectDescription}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* item list */}
            <section className="">
              <div className="flex gap-4 text-start justify-between text-black text-opacity-75 dark:text-white dark:text-opacity-75">
                <span className="w-5/12 ps-1">Item Name</span>
                <span className="w-2/12 text-center">Qty</span>
                <span className="w-2/12 text-center">Price</span>
                <span className="w-2/12 text-center">Total</span>
                <span className="w-1/12"></span>
              </div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    className="flex gap-4 my-1"
                    key={index}
                    initial={{ opacity: 0, y: "15%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    exit={{ opacity: 0, y: "15%" }}
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md my-1 px-2 pt-2 pb-2.5 w-5/12 text-start"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={item.qty}
                      onChange={(e) =>
                        handleInputChange(index, "qty", e.target.value)
                      }
                      className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md my-1 px-2 pt-2 pb-2.5 w-2/12"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={item.price}
                      onChange={(e) =>
                        handleInputChange(index, "price", e.target.value)
                      }
                      className="bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold outline outline-1  outline-gray-400 dark:outline-none rounded-md my-1 px-2 pt-2 pb-2.5 w-2/12"
                    />
                    <input
                      disabled
                      value={item.total}
                      className="bg-transparent rounded-md my-1 px-0 pt-2 pb-2.5 w-2/12 text-center font-semibold"
                    />
                    <span
                      onClick={() => {
                        setTimeout(() => {
                          handleDeleteItem(index);
                        }, 500);
                      }}
                      className="rounded-md my-1 px-2 pt-2 pb-2.5 w-1/12 cursor-pointer"
                    >
                      <img src={deleteBtn} />
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div>
                <input
                  type="button"
                  value="+ Add New Item"
                  onClick={handleAddItem}
                  className="mt-2.5 mb-2 py-3 w-full rounded-3xl cursor-pointer bg-[#232945] text-white dark:bg-primary-dark"
                />
              </div>
            </section>

            <div className="flex justify-end items-center gap-x-4">
              <button className="border rounded-3xl px-4 py-2 bg-[#f2f2f2] hover:bg-[#e5e5e5] dark:bg-transparent">Cancel</button>
              <button className="border rounded-3xl px-4 py-2 bg-[#fff9f0] hover:bg-[#e5e5e5] dark:bg-transparent" type="submit">
                Save As Pending
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceForm;
