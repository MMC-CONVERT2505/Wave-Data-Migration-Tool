import * as XLSX from "xlsx";

// Wave "YYYY-MM-DD" string ko asli JS Date object me convert karta hai,
// taaki Excel me proper Date cell bane (string nahi).
function toExcelDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? dateStr : d;
}

// ─── Excel export ke liye edges ko flat rows me convert karo ──────────────
export function flattenInvoicesForExcel(edges) {
  const flatData = [];

  for (const edge of edges) {
    const inv = edge.node || {};

    const customer = inv.customer || {};
    const currency = inv.currency || {};
    const amountDue = inv.amountDue || {};
    const amountPaid = inv.amountPaid || {};
    const taxTotal = inv.taxTotal || {};
    const total = inv.total || {};

    const items = inv.items || [];

    for (const item of items) {
      const product = item.product || {};
      const subtotal = item.subtotal || {};
      const itemTotal = item.total || {};
      const account = item.account || {};
      const subtype = account.subtype || {};

      const taxes = item.taxes || [];

      let taxValue = "";
      let taxId = "";
      let taxName = "";

      if (Array.isArray(taxes) && taxes.length) {
        const tax = taxes[0] || {};
        const amount = tax.amount || {};
        const salesTax = tax.salesTax || {};

        taxValue = amount.value ?? "";
        taxId = salesTax.id ?? "";
        taxName = salesTax.name ?? "";
      }

      flatData.push({
        Invoice_ID: inv.id ?? "",
        Status: inv.status ?? "",
        Title: inv.title ?? "",
        Subhead: inv.subhead ?? "",
        Invoice_Number: inv.invoiceNumber ?? "",
        Invoice_Date: toExcelDate(inv.invoiceDate),
        PO_Number: inv.poNumber ?? "",
        Due_Date: toExcelDate(inv.dueDate),
        Customer_ID: customer.id ?? "",
        Customer_Name: customer.name ?? "",
        Currency_Code: currency.code ?? "",
        Amount_Due: amountDue.value ?? "",
        Amount_Paid: amountPaid.value ?? "",
        Tax_Total: taxTotal.value ?? "",
        Total: total.value ?? "",
        Product_ID: product.id ?? "",
        Product_Name: product.name ?? "",
        Item_Description: item.description ?? "",
        Quantity: item.quantity ?? "",
        Unit_Price: item.price ?? "",
        Item_Subtotal: subtotal.value ?? "",
        Item_Total: itemTotal.value ?? "",
        Item_Currency: itemTotal.currency?.symbol ?? "",
        Account_ID: account.id ?? "",
        Account_Name: account.name ?? "",
        Account_Subtype_Name: subtype.name ?? "",
        Account_Subtype_Value: subtype.value ?? "",
        Exchange_Rate: inv.exchangeRate ?? "",
        Footer: inv.footer ?? "",
        Memo: inv.memo ?? "",
        Disable_Credit_Card: inv.disableCreditCardPayments ?? "",
        Taxes: "",
        Amount: "",
        Value: taxValue,
        SalesTax: "",
        Id: taxId,
        Name: taxName,
      });
    }
  }

  return flatData;
}

// Browser me hi workbook banake .xlsx file download karwata hai — koi server call nahi.
export function downloadInvoicesExcel(edges, filename) {
  const flatData = flattenInvoicesForExcel(edges);

  const worksheet = XLSX.utils.json_to_sheet(flatData, {
    cellDates: true,
    dateNF: "yyyy-mm-dd",
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  XLSX.writeFile(workbook, filename, { bookType: "xlsx", cellDates: true });
}
