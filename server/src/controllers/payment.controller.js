import { getInvoices, getAccounts, createManualPayment, getInvoiceByNumber } from "../services/wave.service.js";
import { debugLog } from "../utils/logger.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VALID_METHODS = ["BANK_TRANSFER", "CASH", "CHEQUE", "CREDIT_CARD", "OTHER", "PAYPAL", "UNSPECIFIED"];

// Get invoices list for payment
export async function listInvoices(req, res) {
  const { businessId } = req.params;
  const page     = parseInt(req.query.page)     || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  try {
    const data = await getInvoices(req.session.accessToken, businessId, page, pageSize);
    res.json(data);
  } catch (err) {
    console.error("listInvoices error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
}

// Get accounts list for payment account selection
export async function listAccounts(req, res) {
  const { businessId } = req.params;
  try {
    const accounts = await getAccounts(req.session.accessToken, businessId);
    res.json(accounts);
  } catch (err) {
    console.error("listAccounts error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}

// Create manual payment on invoice
export async function applyPayment(req, res) {
  const { invoiceId, paymentDate, amount, accountId, memo, sendReceipt } = req.body;

  if (!invoiceId || !paymentDate || !amount || !accountId) {
    return res.status(400).json({
      error: "invoiceId, paymentDate, amount, accountId are required",
    });
  }

  try {
    const input = {
      invoiceId,
      paymentDate,
      amount:      parseFloat(amount),
      accountId,
      ...(memo        && { memo }),
      ...(sendReceipt !== undefined && { sendReceipt: Boolean(sendReceipt) }),
    };

    const result = await createManualPayment(req.session.accessToken, input);

    res.json({
      success: result.didSucceed,
      payment: result.payment,
      errors:  result.inputErrors,
    });
  } catch (err) {
    console.error("applyPayment error:", err.responseN?.data || err.message);
    res.status(500).json({ error: "Failed to apply payment" });
  }
}

// Bulk payment — multiple invoices pe ek saath payment
export async function bulkApplyPayment(req, res) {
  const { payments } = req.body; // [{ invoiceId, paymentDate, amount, accountId, memo }]

  if (!payments?.length) {
    return res.status(400).json({ error: "payments array required" });
  }

  const results = [];
  for (const p of payments) {
    try {
      const input = {
        invoiceId:   p.invoiceId,
        paymentDate: p.paymentDate,
        amount:      parseFloat(p.amount),
        accountId:   p.accountId,
        ...(p.memo        && { memo: p.memo }),
        ...(p.sendReceipt !== undefined && { sendReceipt: Boolean(p.sendReceipt) }),
      };
      const result = await createManualPayment(req.session.accessToken, input);
      results.push({
        success:     result.didSucceed,
        payment:     result.payment,
        errors:      result.inputErrors,
        invoiceId:   p.invoiceId,
      });
    } catch (err) {
      results.push({
        success:   false,
        errors:    [{ message: err.message }],
        invoiceId: p.invoiceId,
      });
    }
  }

  res.json({ results });
}
// Excel me diya gaya value (raw Wave account ID YA account ka naam) ko
// asli Wave accountId me resolve karta hai. Agar cell khali hai to
// defaultAccountId (UI me select kiya hua) use hota hai.
function resolveAccountId(rawValue, accountsList, defaultAccountId, rowRef = "") {
  const value = String(rawValue || "").trim();

  if (!value) {
    debugLog(`[account-resolve] row=${rowRef} cell=EMPTY -> using default (${defaultAccountId || "NONE"})`);
    return defaultAccountId || null;
  }

  // Pehle exact ID match try karo
  const byId = accountsList.find((a) => a.id === value);
  if (byId) {
    debugLog(`[account-resolve] row=${rowRef} cell="${value}" -> matched by ID -> "${byId.name}" (${byId.id})`);
    return byId.id;
  }

  // Fir naam se match karo (case-insensitive, extra spaces ignore)
  const byName = accountsList.find(
    (a) => a.name.trim().toLowerCase() === value.toLowerCase()
  );
  if (byName) {
    debugLog(`[account-resolve] row=${rowRef} cell="${value}" -> matched by NAME -> "${byName.name}" (${byName.id})`);
    return byName.id;
  }

  // Kuch match nahi mila to jo diya gaya hai wahi bhej do
  // (backward-compatible — purani sheets jisme sahi raw ID pehle se hai)
  debugLog(`[account-resolve] row=${rowRef} cell="${value}" -> NO MATCH in Wave accounts list -> sending as-is (may fail at Wave)`);
  return value;
}

// ─── Excel se bulk payment ────────────────────────────────────────────────────
// Excel columns: invoice_number* | paymentAccountId (naam ya ID, optional) | payment_date* | amount* | payment_method | exchangeRate | memo
// paymentAccountId khali chhod sakte hain — us case me defaultAccountId use hoga.
export async function bulkCreatePaymentsFromExcel(req, res) {
  const { businessId, payments, defaultAccountId } = req.body;

  if (!businessId || !payments?.length) {
    return res.status(400).json({ error: "businessId and payments array required" });
  }

  // Account naam→ID resolve karne ke liye ek hi baar accounts list fetch kar lo
  let accountsList = [];
  try {
    accountsList = await getAccounts(req.session.accessToken, businessId);
  } catch (err) {
    console.error("Failed to fetch accounts for resolution:", err.response?.data || err.message);
  }

  debugLog(`[bulk-payment] businessId=${businessId} totalRows=${payments.length} accountsFetched=${accountsList.length} defaultAccountId=${defaultAccountId || "NONE"}`);
  debugLog(`[bulk-payment] Wave accounts available:`, accountsList.map((a) => `${a.name} (${a.id})`));

  const results = [];

  for (const row of payments) {
    const rowRef = row._rowRef || row.invoice_number;

    // ── Skip ──
    // Row ko sheet me rakhna hai lekin Wave par push nahi karna — sheet me
    // ek "skip" column me yes/y/true/1 daal do, ya paymentAccountId cell me
    // "SKIP" likh do. Ye row process nahi hogi, na error banega na payment jayega.
    const skipFlag = String(row.skip || "").trim().toLowerCase();
    const isSkip = ["yes", "y", "true", "1"].includes(skipFlag)
      || String(row.paymentAccountId || "").trim().toUpperCase() === "SKIP";
    if (isSkip) {
      debugLog(`[bulk-payment] row=${rowRef} -> SKIPPED (marked skip, not sent to Wave)`);
      results.push({ success: null, skipped: true, rowRef, invoiceNumber: row.invoice_number });
      continue;
    }

    // ── Validation ──
    if (!row.invoice_number) {
      results.push({ success: false, rowRef, errors: [{ message: "invoice_number missing" }] });
      continue;
    }
    const resolvedAccountId = resolveAccountId(row.paymentAccountId, accountsList, defaultAccountId, rowRef);
    if (!resolvedAccountId) {
      results.push({
        success: false,
        rowRef,
        errors: [{ message: "Payment account missing — cell khali hai aur koi default account bhi select nahi hai" }],
      });
      continue;
    }
    if (!row.payment_date) {
      results.push({ success: false, rowRef, errors: [{ message: "payment_date missing" }] });
      continue;
    }
    if (!row.amount || isNaN(parseFloat(row.amount))) {
      results.push({ success: false, rowRef, errors: [{ message: "amount missing or invalid" }] });
      continue;
    }

    try {
      // Invoice number se Wave ID fetch karo
      const invoice = await getInvoiceByNumber(
        req.session.accessToken,
        businessId,
        String(row.invoice_number).trim()
      );

      if (!invoice) {
        results.push({
          success: false,
          rowRef,
          errors: [{ message: `Invoice #${row.invoice_number} Wave mein nahi mila` }],
        });
        continue;
      }

      const paymentMethod = VALID_METHODS.includes(String(row.payment_method || "").toUpperCase())
        ? String(row.payment_method).toUpperCase()
        : "UNSPECIFIED";

      const input = {
        invoiceId:        invoice.id,
        paymentAccountId: resolvedAccountId,
        paymentDate:      String(row.payment_date).trim(),
        amount:           parseFloat(row.amount),
        paymentMethod,
        exchangeRate:     row.exchangeRate ? parseFloat(row.exchangeRate) : 1,
        ...(row.memo && { memo: String(row.memo).trim() }),
      };

      debugLog(`[bulk-payment] row=${rowRef} -> FINAL paymentAccountId being pushed: "${resolvedAccountId}"`);
      debugLog("Payment input:", JSON.stringify(input, null, 2));
      const result = await createManualPayment(req.session.accessToken, input);

      if (!result || result.errors) {
        const errMsg = result?.errors?.[0]?.message || "Wave payment create failed";
        results.push({ success: false, rowRef, errors: [{ message: errMsg }], invoiceNumber: row.invoice_number });
        continue;
      }

      results.push({
        success:       result.didSucceed,
        errors:        result.inputErrors,
        rowRef,
        invoiceNumber: row.invoice_number,
        customer:      invoice.customer?.name,
        amount:        row.amount,
      });

      // Rate limit se bachne ke liye
      await sleep(300);

    } catch (err) {
      console.error(`Payment error [${rowRef}]:`, err.response?.data || err.message);
      results.push({
        success: false,
        rowRef,
        errors:  [{ message: err.message }],
        invoiceNumber: row.invoice_number,
      });
    }
  }

  res.json({ results });
}