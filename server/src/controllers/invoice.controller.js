// import { createInvoice } from "../services/wave.service.js";

// export async function bulkCreateInvoices(req, res) {
//   const { businessId, invoices } = req.body;

//   if (!businessId || !invoices?.length) {
//     return res.status(400).json({ error: "businessId and invoices array are required" });
//   }

//   const results = [];

//   for (const inv of invoices) {
//     try {
//       const input = {
//         businessId,
//         customerId:  inv.customerId,
//         invoiceDate: inv.invoiceDate,
//         status:      inv.status || "SAVED",
//         ...(inv.dueDate       && { dueDate:       inv.dueDate }),
//         ...(inv.memo          && { memo:          inv.memo }),
//         ...(inv.currency      && { currency:      inv.currency }),
//         ...(inv.exchangeRate  && { exchangeRate:  inv.exchangeRate }),
//         ...(inv.poNumber      && { poNumber:      String(inv.poNumber) }),
//         ...(inv.invoiceNumber && { invoiceNumber: String(inv.invoiceNumber) }),

//         items: inv.items.map((item) => {
//           const lineItem = {
//             productId:   item.productId,
//             description: item.description || "",
//             quantity:    item.quantity    || 1,
//             unitPrice:   item.unitPrice,
//           };
//           if (item.taxes?.length) {
//             lineItem.taxes = item.taxes
//               .filter((t) => t.salesTaxId)
//               .map((t) => ({ salesTaxId: t.salesTaxId, amount: { value: t.amount } }));
//           }
//           return lineItem;
//         }),

//         // Wave InvoiceDiscountInput: amount, name, discountType, percentage
//         ...(inv.discount && {
//           discounts: [{
//             ...(inv.discount.amount      && { amount:      inv.discount.amount }),
//             ...(inv.discount.name        && { name:        inv.discount.name }),
//             ...(inv.discount.discountType && { discountType: inv.discount.discountType }),
//             ...(inv.discount.percentage  && { percentage:  inv.discount.percentage }),
//           }],
//         }),
//       };

//       console.log("Invoice input:", JSON.stringify(input, null, 2));
//       const result = await createInvoice(req.session.accessToken, input);

//       results.push({
//         success: result.didSucceed,
//         invoice: result.invoice,
//         errors:  result.inputErrors,
//         rowRef:  inv._rowRef,
//       });
//     } catch (err) {
//       console.error(`Invoice error [${inv._rowRef}]:`, err.response?.data || err.message);
//       results.push({
//         success: false,
//         errors:  [{ message: err.message }],
//         rowRef:  inv._rowRef,
//       });
//     }
//   }

//   res.json({ results });
// }



// import { createInvoice } from "../services/wave.service.js";

// export async function bulkCreateInvoices(req, res) {
//   const { businessId, invoices } = req.body;

//   if (!businessId || !invoices?.length) {
//     return res.status(400).json({ error: "businessId and invoices array are required" });
//   }

//   const results = [];

//   for (const inv of invoices) {
//     try {
//       const input = {
//         businessId,
//         customerId:  inv.customerId,
//         invoiceDate: inv.invoiceDate,
//         status:      inv.status || "SAVED",
//         ...(inv.dueDate       && { dueDate:       inv.dueDate }),
//         ...(inv.memo          && { memo:          inv.memo }),
//         ...(inv.currency      && { currency:      inv.currency }),
//         ...(inv.exchangeRate  && { exchangeRate:  inv.exchangeRate }),
//         ...(inv.poNumber      && { poNumber:      String(inv.poNumber) }),
//         ...(inv.invoiceNumber && { invoiceNumber: String(inv.invoiceNumber) }),

//         items: inv.items.map((item) => {
//           const lineItem = {
//             productId:   item.productId,
//             description: item.description || "",
//             quantity:    item.quantity    || 1,
//             unitPrice:   item.unitPrice,
//           };
//           if (item.taxes?.length) {
//             lineItem.taxes = item.taxes
//               .filter((t) => t.salesTaxId)
//               .map((t) => ({ salesTaxId: t.salesTaxId }));
//           }
//           return lineItem;
//         }),

//         // Wave InvoiceDiscountInput: amount, name, discountType, percentage
//         ...(inv.discount && {
//           discounts: [{
//             ...(inv.discount.amount      && { amount:      inv.discount.amount }),
//             ...(inv.discount.name        && { name:        inv.discount.name }),
//             ...(inv.discount.discountType && { discountType: inv.discount.discountType }),
//             ...(inv.discount.percentage  && { percentage:  inv.discount.percentage }),
//           }],
//         }),
//       };

//       console.log("Invoice input:", JSON.stringify(input, null, 2));
//       const result = await createInvoice(req.session.accessToken, input);

//       results.push({
//         success: result.didSucceed,
//         invoice: result.invoice,
//         errors:  result.inputErrors,
//         rowRef:  inv._rowRef,
//       });
//     } catch (err) {
//       console.error(`Invoice error [${inv._rowRef}]:`, err.response?.data || err.message);
//       results.push({
//         success: false,
//         errors:  [{ message: err.message }],
//         rowRef:  inv._rowRef,
//       });
//     }
//   }

//   res.json({ results });
// }



import { createInvoice } from "../services/wave.service.js";
import { debugLog } from "../utils/logger.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createInvoiceWithRetry(token, input, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await createInvoice(token, input);

    // Check for rate limit in GraphQL errors
    if (result?.errors?.some((e) => e.extensions?.code === "RATE_LIMITED")) {
      const resetAt = result.errors[0]?.extensions?.resetAt;
      const waitMs  = resetAt
        ? Math.max(new Date(resetAt) - Date.now(), 0) + 500
        : attempt * 3000;

      console.warn(`Rate limited. Waiting ${waitMs}ms before retry ${attempt}/${retries}...`);
      await sleep(waitMs);
      continue;
    }

    return result;
  }
  throw new Error("Rate limit retries exhausted");
}

export async function bulkCreateInvoices(req, res) {
  const { businessId, invoices } = req.body;

  if (!businessId || !invoices?.length) {
    return res.status(400).json({ error: "businessId and invoices array are required" });
  }

  const results = [];

  for (const inv of invoices) {
    try {
      const input = {
        businessId,
        customerId:  inv.customerId,
        invoiceDate: inv.invoiceDate,
        status:      inv.status || "SAVED",
        ...(inv.dueDate       && { dueDate:       inv.dueDate }),
        ...(inv.memo          && { memo:          inv.memo }),
        ...(inv.currency      && { currency:      inv.currency }),
        ...(inv.exchangeRate  && { exchangeRate:  inv.exchangeRate }),
        ...(inv.poNumber      && { poNumber:      String(inv.poNumber) }),
        ...(inv.invoiceNumber && { invoiceNumber: String(inv.invoiceNumber) }),

        items: inv.items.map((item) => {
          const lineItem = {
            productId:   item.productId,
            description: item.description || "",
            quantity:    item.quantity    || 1,
            unitPrice:   item.unitPrice,
          };
          if (item.taxes?.length) {
            lineItem.taxes = item.taxes
              .filter((t) => t.salesTaxId)
              .map((t) => ({ salesTaxId: t.salesTaxId }));
          }
          return lineItem;
        }),

        // Wave InvoiceDiscountInput: amount, name, discountType, percentage
        ...(inv.discount && {
          discounts: [{
            ...(inv.discount.amount      && { amount:      inv.discount.amount }),
            ...(inv.discount.name        && { name:        inv.discount.name }),
            ...(inv.discount.discountType && { discountType: inv.discount.discountType }),
            ...(inv.discount.percentage  && { percentage:  inv.discount.percentage }),
          }],
        }),
      };

      debugLog("Invoice input:", JSON.stringify(input, null, 2));
      const result = await createInvoiceWithRetry(req.session.accessToken, input);

      // Wave returns null or errors on duplicate invoice number
      if (!result || result.errors) {
        const errMsg = result?.errors?.[0]?.message || `Invoice #${inv.invoiceNumber} already exists in Wave (duplicate)`;
        results.push({ success: false, errors: [{ message: errMsg }], rowRef: inv._rowRef });
        continue;
      }

      results.push({
        success: result.didSucceed,
        invoice: result.invoice,
        errors:  result.inputErrors,
        rowRef:  inv._rowRef,
      });

      // 300ms delay between invoices to avoid rate limiting
      await sleep(300);
    } catch (err) {
      console.error(`Invoice error [${inv._rowRef}]:`, err.response?.data || err.message);
      results.push({
        success: false,
        errors:  [{ message: err.message }],
        rowRef:  inv._rowRef,
      });
    }
  }

  res.json({ results });
}