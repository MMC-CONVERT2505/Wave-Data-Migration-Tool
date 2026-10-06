import axios from "axios";

const API_URL = "https://gql.waveapps.com/graphql/public";

const INVOICE_QUERY = `
query($businessId: ID!, $page: Int!, $pageSize: Int!) {
  business(id: $businessId) {
    id
    invoices(page: $page, pageSize: $pageSize) {
      pageInfo {
        currentPage
        totalPages
        totalCount
      }
      edges {
        node {
          id
          createdAt
          modifiedAt
          pdfUrl
          viewUrl
          status
          title
          subhead
          invoiceNumber
          invoiceDate
          poNumber
          customer {
            id
            name
          }
          currency {
            code
          }
          dueDate
          amountDue {
            value
            currency { symbol }
          }
          amountPaid {
            value
            currency { symbol }
          }
          taxTotal {
            value
            currency { symbol }
          }
          total {
            value
            currency { symbol }
          }
          exchangeRate
          footer
          memo
          disableCreditCardPayments
          disableBankPayments
          itemTitle
          unitTitle
          priceTitle
          amountTitle
          hideName
          hideDescription
          hideUnit
          hidePrice
          hideAmount
          items {
            product {
              id
              name
            }
            description
            quantity
            price
            subtotal {
              value
              currency { symbol }
            }
            total {
              value
              currency { symbol }
            }
            account {
              id
              name
              subtype { name value }
            }
            taxes {
              amount { value }
              salesTax {
                id
                name
              }
            }
          }
          lastSentAt
          lastSentVia
          lastViewedAt
        }
      }
    }
  }
}
`;

// ─── Fetch invoices (all pages) then filter by invoiceDate range ──────────
export async function fetchInvoices(startDate, endDate, businessId, apiToken) {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  let page = 1;
  const allEdges = [];

  while (true) {
    const variables = { businessId, page, pageSize: 100 };

    const res = await axios.post(
      API_URL,
      { query: INVOICE_QUERY, variables },
      { headers }
    );

    const data = res.data;

    if (data.errors) {
      throw new Error(JSON.stringify(data.errors));
    }

    const invoicesData = data.data?.business?.invoices;
    if (!invoicesData) break;

    const edges = invoicesData.edges;
    if (!edges || edges.length === 0) break;

    allEdges.push(...edges);

    if (page >= invoicesData.pageInfo.totalPages) break;

    page += 1;
    await new Promise((r) => setTimeout(r, 300)); // rate limit se bachne ke liye
  }

  // Date filter (invoiceDate string comparison, jaise Python me tha)
  const filtered = allEdges.filter((edge) => {
    const date = edge.node?.invoiceDate;
    return date && startDate <= date && date <= endDate;
  });

  return filtered;
}

// ─── Excel export ke liye edges ko flat rows me convert karo ──────────────
// Wave "YYYY-MM-DD" string ko asli JS Date object me convert karta hai,
// taaki Excel me proper Date cell bane (string nahi).
function toExcelDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? dateStr : d;
}

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
