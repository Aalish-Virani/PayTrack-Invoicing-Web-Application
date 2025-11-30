import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const DeleteInvoiceConfirmationBox = ({ invoiceId, onCancel, onConfirm }) => {
  return (
    <div>
      {/* black overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className=" fixed inset-0 flex justify-center bg-black bg-opacity-70"
      ></motion.div>

      {/* confirmation box */}
      <motion.div
        initial={{ scale: 0.25 }}
        animate={{ scale: 1 }}
        className=" absolute top-[330px] right-[550px] bg-primary-light dark:bg-primary-dark p-8 rounded-xl shadow-lg min-w-96"
      >
        <h2 className="text-lg font-bold">Confirm Deletion</h2>
        <p className="mt-5 mb-8 mr-20">
          Are you sure you want to delete invoice <b>{`#${invoiceId} `}</b>?{" "}
          <br /> This action can't be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className=" px-5 py-3 rounded-3xl font-bold text-sm  bg-black dark:bg-white bg-opacity-5 dark:bg-opacity-5 hover:bg-opacity-10 hover:dark:bg-opacity-10 "
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(invoiceId);
            }}
            className="px-4 py-3 rounded-3xl font-bold text-sm text-white bg-[#ec5957] hover:bg-opacity-90"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteInvoiceConfirmationBox;
