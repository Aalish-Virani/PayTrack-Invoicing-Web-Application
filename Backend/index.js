let con = require("./connection");
let express = require("express");
let cors = require("cors");
const { error } = require("console");

let app = express();
app.use(cors());
app.use(express.json());

const port = 5173;

app.listen({ port }, () => {
  console.log(`listening...${port}`);
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// user signup -----------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.post("/user/signup", (req, res) => {
  console.log("Received signup request:", req.body);

  const sql = `
        INSERT INTO paytrack_users (first_name, last_name, email, password) VALUES (?)    
    `;
  const values = [
    req.body.firstName,
    req.body.lastName,
    req.body.email,
    req.body.password,
  ];
  console.log("Executing SQL query:", sql);
  con.query(sql, [values], (err, data) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        console.error("Duplicate entry error:", err);
        return res
          .status(409)
          .json({ status: 409, message: "User already exists" });
      }
      console.error("Database error:", err);
      return res.status(500).json({ status: 500, error: "Database error" });
    } else {
      const newUserId = data.insertId;
      console.log("Insertion successful:", data);
      return res.status(201).json({
        status: 201,
        message: "User created",
        userId: newUserId,
        data,
      });
    }
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// user login -----------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.post("/user/login", (req, res) => {
  console.log("Received login request:", req.body);
  const sql = `
        SELECT user_id, email, password FROM paytrack_users WHERE email = ? AND password = ?   
    `;
  const values = [req.body.email, req.body.password];
  con.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      if (data.length === 0) {
        return res.status(404).json("User not found");
      }
      return res.json(data);
    }
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// fetch all invoices summary --------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/invoices/:id", (req, res) => {
  const userId = req.params.id;

  // Query to fetch invoices for the user
  const sqlInvoices = `
    SELECT
      invoice_id,
      payment_due,
      client_name,
      invoice_status
    FROM
      invoice_details
    WHERE
      user_id = ?;
  `;

  con.query(sqlInvoices, [userId], (err, invoices) => {
    if (err) {
      console.error("Error fetching invoices:", err);
      return res.status(500).json({ error: "Error fetching invoices" });
    }

    if (!invoices.length) {
      console.log("No invoices found for user");
      return res.status(404).json({ message: "No invoices found" });
    }

    if (invoices.length > 0) {
      console.log("Invoices found for user");
    }

    // Generate promises to fetch invoice totals
    const invoicePromises = invoices.map((invoice) => {
      const sqlTotal = `
        SELECT
          ROUND(SUM(item_total), 2) AS total
        FROM
          invoice_items
        WHERE
          user_id = ? AND invoice_id = ?;
      `;

      return new Promise((resolve, reject) => {
        con.query(sqlTotal, [userId, invoice.invoice_id], (err, result) => {
          if (err) {
            console.log("error fetching invoice total");
            return reject(err);
          } else {
            // Attach total to the invoice object
            invoice.total = result[0]?.total || 0.0; // Default to 0 if no total
            console.log("invoice total fetched successfully");
            resolve(invoice);
          }
        });
      });
    });

    // Resolve all promises and send the response
    Promise.all(invoicePromises)
      .then((invoicesWithTotals) => res.json(invoicesWithTotals))
      .catch((err) => {
        console.error("Error fetching invoice totals:", err);
        res.status(500).json({ error: "Error fetching invoice totals" });
      });
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// fetch invoices details --------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/invoiceDetails/:userId/:invoiceId", (req, res) => {
  const userId = req.params.userId;
  const invoiceId = req.params.invoiceId;

  // Main invoice query
  const invoicesql = `
        SELECT
            id.invoice_id,
            id.created_at,
            id.payment_due,
            id.project_description,
            id.payment_terms,
            id.client_name,
            id.client_email,
            id.invoice_status
        FROM
            invoice_details AS id
        WHERE
            id.user_id = ? AND id.invoice_id = ?;
  `;

  con.query(invoicesql, [userId, invoiceId], (err, invoices) => {
    if (err) {
      console.log("Error fetching invoice details:", err);
      return res.status(500).json({ error: "Error fetching invoice details" });
    }

    if (invoices.length === 0) {
      console.log("Invoice not found");
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoice = invoices[0]; // Since invoice_id is unique, there will be only one record

    console.log("invoice found", invoice);

    // Queries for client address and sender address
    const clientAddressQuery = `
        SELECT 
            street AS client_street,
            city AS client_city,
            postcode AS client_postcode,
            country AS client_country
        FROM
            client_address
        WHERE
            user_id = ? AND invoice_id = ?;
    `;

    const senderAddressQuery = `
        SELECT 
            street AS sender_street,
            city AS sender_city,
            postcode AS sender_postcode,
            country AS sender_country
        FROM
            sender_address
        WHERE
            user_id = ? AND invoice_id = ?;
    `;

    // Query for invoice items
    const itemsQuery = `
        SELECT
            item_name,
            item_quantity,
            item_price,
            item_total
        FROM
            invoice_items
        WHERE
            user_id = ? AND invoice_id = ?;
    `;

    // Execute all queries in parallel
    Promise.all([
      new Promise((resolve, reject) => {
        con.query(
          clientAddressQuery,
          [userId, invoiceId],
          (err, clientAddress) => {
            if (err) return reject(err);
            resolve(clientAddress[0] || null); // Return null if no record is found
          }
        );
      }),
      new Promise((resolve, reject) => {
        con.query(
          senderAddressQuery,
          [userId, invoiceId],
          (err, senderAddress) => {
            if (err) return reject(err);
            resolve(senderAddress[0] || null); // Return null if no record is found
          }
        );
      }),
      new Promise((resolve, reject) => {
        con.query(itemsQuery, [userId, invoiceId], (err, items) => {
          if (err) return reject(err);
          resolve(items || []); // Return an empty array if no items found
        });
      }),
    ])
      .then(([clientAddress, senderAddress, items]) => {
        // Attach addresses and items to the invoice
        invoice.client_address = clientAddress;
        invoice.sender_address = senderAddress;
        invoice.items = items;

        // Send the final response
        console.log(invoice);
        return res.json(invoice);
      })
      .catch((err) => {
        console.error("Error fetching related data:", err);
        return res.status(500).json({ error: "Error fetching related data" });
      });
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// invoice status update -------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.put("/invoice/:id/status", (req, res) => {
  const invoiceId = req.params.id; // The invoice ID to update
  const { status } = req.body; // The new status value from the request body

  const updateStatusSql = `
    UPDATE invoice_details
    SET invoice_status = ?
    WHERE invoice_id = ?;
  `;

  con.query(updateStatusSql, [status, invoiceId], (err, result) => {
    if (err) {
      return res.json(err);
    }

    // Check if any rows were affected (i.e., if the invoice ID was found and updated)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Successfully updated
    return res.json({ message: "Invoice status updated successfully" });
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// invoice delete -------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.delete("/invoice/:id/delete", async (req, res) => {
  const invoiceId = req.params.id;

  try {
    await con.beginTransaction();

    await con.query("DELETE FROM invoice_details WHERE invoice_id = ?", [
      invoiceId,
    ]);
    await con.query("DELETE FROM invoice_items WHERE invoice_id = ?", [
      invoiceId,
    ]);
    await con.query("DELETE FROM client_address WHERE invoice_id = ?", [
      invoiceId,
    ]);
    await con.query("DELETE FROM sender_address WHERE invoice_id = ?", [
      invoiceId,
    ]);

    await con.commit();

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    await con.rollback();
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// new invoice -------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.post("/invoice/create/:user/:invoice", (req, res) => {
  const userId = req.params.user;
  const invoiceId = req.params.invoice;

  const data = req.body;

  console.log(invoiceId, data);

  const invoiceData = [
    userId,
    invoiceId,
    data.createdAt,
    data.paymentDue,
    data.projectDescription,
    data.paymentTerms,
    data.clientName,
    data.clientEmail,
    "Pending",
  ];

  const senderData = [
    userId,
    invoiceId,

    data.senderStreet,
    data.senderCity,
    data.senderPostCode,
    data.senderCountry,
  ];

  const clientData = [
    userId,
    invoiceId,

    data.clientStreet,
    data.clientCity,
    data.clientPostCode,
    data.clientCountry,
  ];

  const itemsData = data.items
    .filter(
      (item) =>
        !(
          item.name === "" &&
          item.qty === "" &&
          item.price === "" &&
          item.total === ""
        )
    ) // Filter out items with any null value
    .map((item) => [
      userId,
      invoiceId,
      item.name,
      item.qty,
      item.price,
      item.total,
    ]);

  // SQL queries
  const invoiceQuery = `
    INSERT INTO invoice_details (
      user_id, invoice_id, created_at, payment_due, project_description, 
      payment_terms, client_name, client_email, invoice_status
    ) VALUES (?);
  `;

  const clientAddressQuery = `
  INSERT INTO client_address (
    user_id, invoice_id, street, city, postcode, country
  ) VALUES (?);
`;

  const senderAddressQuery = `
  INSERT INTO sender_address (
    user_id, invoice_id, street, city, postcode, country
  ) VALUES (?);
`;

  const invoiceItemsQuery = `
  INSERT INTO invoice_items (
    user_id, invoice_id, item_name, item_quantity, item_price, item_total
  ) VALUES ?;
`;

  con.beginTransaction((transactionErr) => {
    if (transactionErr) {
      console.error("Transaction start error:", transactionErr);
      return res
        .status(500)
        .json({ status: 500, error: "Transaction start error" });
    }

    // Execute invoice query
    con.query(invoiceQuery, [invoiceData], (err, data) => {
      if (err) {
        console.error("Invoice query error:", err);
        return con.rollback(() => {
          res
            .status(500)
            .json({ status: 500, error: "Failed to create invoice" });
        });
      }

      // Execute client address query
      con.query(clientAddressQuery, [clientData], (err, data) => {
        if (err) {
          console.error("Client address query error:", err);
          return con.rollback(() => {
            res
              .status(500)
              .json({ status: 500, error: "Failed to create client address" });
          });
        }

        // Execute sender address query
        con.query(senderAddressQuery, [senderData], (err, data) => {
          if (err) {
            console.error("Sender address query error:", err);
            return con.rollback(() => {
              res.status(500).json({
                status: 500,
                error: "Failed to create sender address",
              });
            });
          }

          // Execute items query
          if (itemsData != "") {
            con.query(invoiceItemsQuery, [itemsData], (err, data) => {
              if (err) {
                console.error("Invoice Items query error:", err);

                return con.rollback(() => {
                  res.status(500).json({
                    status: 500,
                    error: "Failed to create Invoice Items",
                  });
                });
              }
            });
          }

          // Commit transaction
          con.commit((commitErr) => {
            if (commitErr) {
              console.error("Transaction commit error:", commitErr);
              return con.rollback(() => {
                res
                  .status(500)
                  .json({ status: 500, error: "Transaction commit error" });
              });
            }

            console.log("All queries executed successfully");
            res.status(201).json({
              status: 201,
              message: "Invoice created successfully",
              invoiceId: invoiceId,
            });
          });
        });
      });
    });
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// edit invoice -------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.put("/invoice/edit/:user/:invoice", (req, res) => {
  const userId = req.params.user;
  const invoiceId = req.params.invoice;

  const data = req.body;

  console.log("Updating invoice:", invoiceId, data);

  // Prepare data for SQL queries
  const invoiceData = [
    data.createdAt,
    data.paymentDue,
    data.projectDescription,
    data.paymentTerms,
    data.clientName,
    data.clientEmail,
    "Pending",
    userId,
    invoiceId,
  ];

  const senderData = [
    data.senderStreet,
    data.senderCity,
    data.senderPostCode,
    data.senderCountry,
    userId,
    invoiceId,
  ];

  const clientData = [
    data.clientStreet,
    data.clientCity,
    data.clientPostCode,
    data.clientCountry,
    userId,
    invoiceId,
  ];

  const invoiceItemsDeleteQuery = `
    DELETE FROM invoice_items WHERE user_id = ? AND invoice_id = ?;
  `;

  const invoiceItemsInsertQuery = `
    INSERT INTO invoice_items (
      user_id, invoice_id, item_name, item_quantity, item_price, item_total
    ) VALUES ?;
  `;

  const itemsData = data.items
    .filter(
      (item) =>
        !(
          item.name === "" &&
          item.qty === "" &&
          item.price === "" &&
          item.total === ""
        )
    ) // Filter out items with any null value
    .map((item) => [
      userId,
      invoiceId,
      item.name,
      item.qty,
      item.price,
      item.total,
    ]);

  // SQL queries for updating data
  const invoiceQuery = `
    UPDATE invoice_details 
    SET 
      created_at = ?, 
      payment_due = ?, 
      project_description = ?, 
      payment_terms = ?, 
      client_name = ?, 
      client_email = ?, 
      invoice_status = ? 
    WHERE user_id = ? AND invoice_id = ?;
  `;

  const clientAddressQuery = `
    UPDATE client_address 
    SET 
      street = ?, 
      city = ?, 
      postcode = ?, 
      country = ? 
    WHERE user_id = ? AND invoice_id = ?;
  `;

  const senderAddressQuery = `
    UPDATE sender_address 
    SET 
      street = ?, 
      city = ?, 
      postcode = ?, 
      country = ? 
    WHERE user_id = ? AND invoice_id = ?;
  `;

  // Begin transaction for updating data
  con.beginTransaction((transactionErr) => {
    if (transactionErr) {
      console.error("Transaction start error:", transactionErr);
      return res
        .status(500)
        .json({ status: 500, error: "Transaction start error" });
    }

    // Update invoice details
    con.query(invoiceQuery, invoiceData, (err, result) => {
      if (err) {
        console.error("Invoice update error:", err);
        return con.rollback(() => {
          res
            .status(500)
            .json({ status: 500, error: "Failed to update invoice" });
        });
      }

      // Update client address
      con.query(clientAddressQuery, clientData, (err, result) => {
        if (err) {
          console.error("Client address update error:", err);
          return con.rollback(() => {
            res
              .status(500)
              .json({ status: 500, error: "Failed to update client address" });
          });
        }

        // Update sender address
        con.query(senderAddressQuery, senderData, (err, result) => {
          if (err) {
            console.error("Sender address update error:", err);
            return con.rollback(() => {
              res.status(500).json({
                status: 500,
                error: "Failed to update sender address",
              });
            });
          }

          // Delete existing items before inserting updated ones
          con.query(
            invoiceItemsDeleteQuery,
            [userId, invoiceId],
            (err, result) => {
              if (err) {
                console.error("Invoice items delete error:", err);
                return con.rollback(() => {
                  res.status(500).json({
                    status: 500,
                    error: "Failed to delete invoice items",
                  });
                });
              }

              // Insert updated items
              if (itemsData != "") {
                con.query(
                  invoiceItemsInsertQuery,
                  [itemsData],
                  (err, result) => {
                    if (err) {
                      console.error("Invoice items insert error:", err);
                      return con.rollback(() => {
                        res.status(500).json({
                          status: 500,
                          error: `Failed to insert invoice items`,
                        });
                      });
                    }
                  }
                );
              }

              // Commit transaction
              con.commit((commitErr) => {
                if (commitErr) {
                  console.error("Transaction commit error:", commitErr);
                  return con.rollback(() => {
                    res.status(500).json({
                      status: 500,
                      error: "Transaction commit error",
                    });
                  });
                }

                console.log("Invoice updated successfully");
                res.status(200).json({
                  status: 200,
                  message: "Invoice updated successfully",
                });
              });
            }
          );
        });
      });
    });
  });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// GET user profile + stats
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/user/profile/:userId", (req, res) => {
  const userId = req.params.userId;

  const userQuery = `SELECT first_name, last_name FROM paytrack_users WHERE user_id = ?`;

  const statsQuery = `
    SELECT 
      COUNT(*) as total_invoices,
      COALESCE(SUM(CASE WHEN invoice_status = 'Paid' THEN total ELSE 0 END), 0) as paid_amount,
      COALESCE(SUM(CASE WHEN invoice_status = 'Pending' THEN total ELSE 0 END), 0) as pending_amount
    FROM (
      SELECT id.invoice_status,
             ROUND(SUM(ii.item_total), 2) as total
      FROM invoice_details id
      LEFT JOIN invoice_items ii ON id.invoice_id = ii.invoice_id AND id.user_id = ii.user_id
      WHERE id.user_id = ?
      GROUP BY id.invoice_id, id.invoice_status
    ) as invoice_totals
  `;

  con.query(userQuery, [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: "DB Error" });

    if (userResult.length === 0)
      return res.status(404).json({ error: "User not found" });

    con.query(statsQuery, [userId], (err, statsResult) => {
      if (err) return res.status(500).json({ error: "DB Error" });

      const stats = statsResult[0];

      res.json({
        firstName: userResult[0].first_name,
        lastName: userResult[0].last_name,
        totalInvoices: stats.total_invoices,
        paidAmount: parseFloat(stats.paid_amount).toFixed(2),
        pendingAmount: parseFloat(stats.pending_amount).toFixed(2),
      });
    });
  });
});
