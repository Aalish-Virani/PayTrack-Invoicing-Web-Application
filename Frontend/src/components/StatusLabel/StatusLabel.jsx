import React, { useEffect, useState } from "react";
import { useSelectedInvoice } from "../../contexts/SelectedInvoiceContext/SelectedInvoiceContext.jsx";

const StatusLabel = React.memo(({ status }) => {
  const [color, setColor] = useState("0, 100%, 67%");
  const [label, setLabel] = useState("Draft");

  const markedAsPaid = useSelectedInvoice().isSelectedInvoiceMarkedAsPaid();

  useEffect(() => {
    if (status === "Paid" || markedAsPaid) {
      setColor("160, 62%, 52%");
      setLabel("Paid");
    } else if (status === "Pending") {
      setColor("35, 98%, 50%");
      setLabel("Pending");
    } else if (status === "Draft") {
      setColor("235, 68%, 93%");
      setLabel("Draft");
    } else if (status === "Archived") {
      setColor("236, 49%, 45%");
      setLabel("Archived");
    }
  }, [status, markedAsPaid]);

  return (
    <div
      style={{
        color: `hsl(${color})`,
        backgroundColor: `hsl(${color} , 0.06 )`,
      }}
      className="flex  backdrop-blur-3xl items-center h-12 w-28 gap-2 justify-center rounded-lg"
    >
      <span
        className="h-2 aspect-square rounded-full"
        style={{
          backgroundColor: `hsl(${color})`,
        }}
      ></span>
      <span className="font-bold text-center pb-0.5">{label}</span>
    </div>
  );
});

export default StatusLabel;
