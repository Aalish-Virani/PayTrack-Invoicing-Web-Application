import React, { useState } from "react";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";
import { useUserContext } from "../../contexts/UserContext/UserContext.jsx";
import DeleteInvoiceConfirmationBox from "../DeleteInvoiceConfirmationBox/DeleteInvoiceConfirmationBox.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DeleteInvoiceBtn = () => {
  const { getUserId } = useUserContext();
  const { getSelectedInvoiceId, updateSelectedInvoice } = useSelectedInvoice();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const navigate = useNavigate();

  const handleDelete = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleDeleteKey = (event) => {
    console.log("delete key");
    if (event.key === "Delete") {
      handleDelete();
    }
  };

  const handleConfirmDelete = async (invoiceId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5173/invoice/${invoiceId}/delete`
      );

      if (response.status === 200) {
        console.log(`Invoice #${invoiceId} deleted successfully.`);
        navigate("/");
      } else {
        console.error("Failed to delete the invoice:", response.data);
      }
    } catch (error) {
      console.error(
        "Error deleting the invoice:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="">
      <button
        onClick={handleDelete}
        onKeyDown={handleDeleteKey}
        className="px-4 py-3 rounded-3xl font-bold text-sm text-white bg-[#ec5957] hover:bg-opacity-85"
      >
        Delete
      </button>

      {showConfirmation && (
        <DeleteInvoiceConfirmationBox
          invoiceId={getSelectedInvoiceId()}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default DeleteInvoiceBtn;
