import React, { useState } from "react";
import { delay, motion } from "framer-motion";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";

const MarkAsPaidBtn = React.memo(({ status, invoiceId }) => {
  const {
    setSelectedInvoiceStatus,
    setSelectedInvoiceMarkedAsPaid,
    setSelectedInvoiceMarkedAsPending,
  } = useSelectedInvoice();

  const isPending = status == "Pending" ? true : false;

  const markedAsPaid = useSelectedInvoice().isSelectedInvoiceMarkedAsPaid();

  const flipVariants = {
    paid: {
      rotateX: 0,
      backgroundColor: "#7f5bf8",
      color: ["#ffffff"],
      transition: {
        rotateX: { duration: 0.6, type: "spring" }, // Smooth spring animation (6s)
        backgroundColor: { duration: 0.075, delay: 0.075 }, // Background color delay
        color: { duration: 0.0001 }, // 1ms delay for color change
      },
    },
    undo: {
      rotateX: 180,
      backgroundColor: "#ffffff",
      color: "#7f5bf8",
      transition: {
        rotateX: { duration: 0.6, type: "spring" }, // Same transition settings
        backgroundColor: { duration: 0.075, delay: 0.075 },
        color: { duration: 0.1 },
      },
    },
  };

  const handleUpdate = async () => {
    const newStatus = markedAsPaid ? "Pending" : "Paid";

    try {
      console.log(markedAsPaid);
      const response = await fetch(
        `http://localhost:5173/invoice/${invoiceId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }), // Update status
        }
      );

      if (response.ok) {
        if (markedAsPaid) {
          setSelectedInvoiceMarkedAsPending();
        } else {
          setSelectedInvoiceMarkedAsPaid();
        }
        setSelectedInvoiceStatus(newStatus);
        console.log("Status updated successfully.");
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <motion.button
      onClick={handleUpdate}
      animate={markedAsPaid ? "undo" : "paid"}
      variants={flipVariants}
      transition={{ duration: 6, type: "spring" }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ opacity: 0.925 }}
      className={` ${
        isPending || markedAsPaid ? "block" : "hidden"
      } w-32 px-4 py-3 rounded-3xl font-bold text-sm`}
    >
      <span className={`${markedAsPaid ? "hidden  " : "block"}`}>
        Mark As Paid
      </span>
      <span
        className={` transform scale-y-[-1] ${
          markedAsPaid ? "block" : "hidden "
        }`}
      >
        Undo
      </span>
    </motion.button>
  );
});

export default MarkAsPaidBtn;
