// import axios from "axios";
// import waveConfig from "../config/wave.config.js";

// const { GQL_URL, TOKEN_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = waveConfig;

// export async function exchangeToken(code) {
//   const res = await axios.post(
//     TOKEN_URL,
//     new URLSearchParams({
//       grant_type: "authorization_code",
//       code,
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       redirect_uri: REDIRECT_URL,
//     }),
//     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//   );
//   return res.data.access_token;
// }

// async function gqlRequest(token, query, variables = {}) {
//   const res = await axios.post(
//     GQL_URL,
//     { query, variables },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return res.data;
// }

// export async function getBusinesses(token) {
//   const query = `
//     query {
//       businesses(page: 1, pageSize: 20) {
//         edges {
//           node {
//             id
//             name
//             isPersonal
//             organizationalType
//             currency { code symbol }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query);
//   const businesses = data.data.businesses.edges.map((e) => e.node);
//   businesses.forEach((b) => console.log(`Business: ${b.name} → ID: ${b.id}`));
//   return businesses;
// }

// export async function getCustomers(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         customers(page: 1, pageSize: 2000) {
//           edges {
//             node { id name email }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("Customers raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.customers?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// export async function getProducts(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         products(page: 1, pageSize: 100) {
//           edges {
//             node { id name isSold }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("Products raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.products?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// export async function createInvoice(token, input) {
//   const mutation = `
//     mutation ($input: InvoiceCreateInput!) {
//       invoiceCreate(input: $input) {
//         didSucceed
//         inputErrors { message code path }
//         invoice {
//           id
//           invoiceNumber
//           status
//           viewUrl
//           total { value currency { symbol } }
//           customer { name }
//         }
//       }
//     }
//   `;
//   console.log('Invoice input being sent:', JSON.stringify(input, null, 2));
//   const data = await gqlRequest(token, mutation, { input });
//   console.log('Invoice response:', JSON.stringify(data, null, 2));
//   return data.data.invoiceCreate;
// }




// import axios from "axios";
// import waveConfig from "../config/wave.config.js";

// const { GQL_URL, TOKEN_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = waveConfig;

// export async function exchangeToken(code) {
//   const res = await axios.post(
//     TOKEN_URL,
//     new URLSearchParams({
//       grant_type: "authorization_code",
//       code,
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       redirect_uri: REDIRECT_URL,
//     }),
//     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//   );
//   return res.data.access_token;
// }

// async function gqlRequest(token, query, variables = {}) {
//   const res = await axios.post(
//     GQL_URL,
//     { query, variables },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return res.data;
// }

// export async function getBusinesses(token) {
//   const query = `
//     query {
//       businesses(page: 1, pageSize: 20) {
//         edges {
//           node {
//             id
//             name
//             isPersonal
//             organizationalType
//             currency { code symbol }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query);
//   const businesses = data.data.businesses.edges.map((e) => e.node);
//   businesses.forEach((b) => console.log(`Business: ${b.name} → ID: ${b.id}`));
//   return businesses;
// }

// export async function getCustomers(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         customers(page: 1, pageSize: 2000) {
//           edges {
//             node { id name email }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("Customers raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.customers?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// export async function getProducts(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         products(page: 1, pageSize: 100) {
//           edges {
//             node { id name isSold }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("Products raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.products?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// // ── NEW: Sales taxes fetch karo ──────────────────────────────────────
// export async function getSalesTaxes(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         salesTaxes(page: 1, pageSize: 2000) {
//           edges {
//             node {
//               id
//               name
//               abbreviation
//               taxNumber
//               rate
//               isCompound
//             }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("SalesTaxes raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.salesTaxes?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// export async function createInvoice(token, input) {
//   const mutation = `
//     mutation ($input: InvoiceCreateInput!) {
//       invoiceCreate(input: $input) {
//         didSucceed
//         inputErrors { message code path }
//         invoice {
//           id
//           invoiceNumber
//           status
//           viewUrl
//           total { value currency { symbol } }
//           customer { name }
//         }
//       }
//     }
//   `;
//   console.log('Invoice input being sent:', JSON.stringify(input, null, 2));
//   const data = await gqlRequest(token, mutation, { input });
//   console.log('Invoice response:', JSON.stringify(data, null, 2));
//   return data.data.invoiceCreate;
// }














import axios from "axios";
import waveConfig from "../config/wave.config.js";
import { debugLog } from "../utils/logger.js";

const { GQL_URL, TOKEN_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = waveConfig;

export async function exchangeToken(code) {
  const res = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URL,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data.access_token;
}

async function gqlRequest(token, query, variables = {}) {
  const res = await axios.post(
    GQL_URL,
    { query, variables },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
}

export async function getBusinesses(token) {
  const query = `
    query {
      businesses(page: 1, pageSize: 20) {
        edges {
          node {
            id
            name
            isPersonal
            organizationalType
            currency { code symbol }
          }
        }
      }
    }
  `;
  const data = await gqlRequest(token, query);
  const businesses = data.data.businesses.edges.map((e) => e.node);
  businesses.forEach((b) => debugLog(`Business: ${b.name} → ID: ${b.id}`));
  return businesses;
}

export async function getCustomers(token, businessId) {
  const query = `
    query($businessId: ID!) {
      business(id: $businessId) {
        customers(page: 1, pageSize: 2000) {
          edges {
            node { id name email }
          }
        }
      }
    }
  `;
  const data = await gqlRequest(token, query, { businessId });
  debugLog("Customers raw response:", JSON.stringify(data, null, 2));

  const edges = data?.data?.business?.customers?.edges;
  if (!edges) return [];
  return edges.map((e) => e.node);
}

export async function getProducts(token, businessId) {
  const query = `
    query($businessId: ID!) {
      business(id: $businessId) {
        products(page: 1, pageSize: 100) {
          edges {
            node { id name isSold }
          }
        }
      }
    }
  `;
  const data = await gqlRequest(token, query, { businessId });
  debugLog("Products raw response:", JSON.stringify(data, null, 2));

  const edges = data?.data?.business?.products?.edges;
  if (!edges) return [];
  return edges.map((e) => e.node);
}

export async function getSalesTaxes(token, businessId) {
  const query = `
    query($businessId: ID!) {
      business(id: $businessId) {
        salesTaxes(page: 1, pageSize: 2000) {
          edges {
            node {
              id
              name
              abbreviation
              taxNumber
              rate
              isCompound
            }
          }
        }
      }
    }
  `;
  const data = await gqlRequest(token, query, { businessId });
  debugLog("SalesTaxes raw response:", JSON.stringify(data, null, 2));

  const edges = data?.data?.business?.salesTaxes?.edges;
  if (!edges) return [];
  return edges.map((e) => e.node);
}

export async function createInvoice(token, input) {
  const mutation = `
    mutation ($input: InvoiceCreateInput!) {
      invoiceCreate(input: $input) {
        didSucceed
        inputErrors { message code path }
        invoice {
          id
          invoiceNumber
          status
          viewUrl
          total { value currency { symbol } }
          customer { name }
        }
      }
    }
  `;
  debugLog('Invoice input being sent:', JSON.stringify(input, null, 2));
  const data = await gqlRequest(token, mutation, { input });
  debugLog('Invoice response:', JSON.stringify(data, null, 2));
  return data.data.invoiceCreate;
}

// ─── Payment module ke liye NEW functions ─────────────────────────────

export async function getAccounts(token, businessId) {
  const query = `
    query($businessId: ID!) {
      business(id: $businessId) {
        accounts(page: 1, pageSize: 1000) {
          edges {
            node {
              id name
              subtype { name value }
              type { name value }
              isArchived
            }
          }
        }
      }
    }
  `;
  const data = await gqlRequest(token, query, { businessId });
  const edges = data?.data?.business?.accounts?.edges;
  if (!edges) { console.error("Accounts null"); return []; }
  return edges.map((e) => e.node).filter((a) => !a.isArchived);
}

export async function getInvoices(token, businessId, page = 1, pageSize = 50) {
  const query = `
    query($businessId: ID!, $page: Int!, $pageSize: Int!) {
      business(id: $businessId) {
        invoices(page: $page, pageSize: $pageSize) {
          pageInfo { currentPage totalPages totalCount }
          edges {
            node {
              id invoiceNumber status invoiceDate dueDate
              amountDue  { value currency { symbol code } }
              amountPaid { value currency { symbol code } }
              total      { value currency { symbol code } }
              customer   { id name }
            }
          }
        }
      }
    }
  `;
  const data = await gqlRequest(token, query, { businessId, page, pageSize });
  const invoiceData = data?.data?.business?.invoices;
  if (!invoiceData) return { invoices: [], pageInfo: {} };
  return {
    invoices: invoiceData.edges.map((e) => e.node),
    pageInfo: invoiceData.pageInfo,
  };
}

export async function getInvoiceByNumber(token, businessId, invoiceNumber) {
  const query = `
    query($businessId: ID!, $invoiceNumber: String!) {
      business(id: $businessId) {
        invoices(invoiceNumber: $invoiceNumber, page: 1, pageSize: 5) {
          edges {
            node {
              id
              invoiceNumber
              status
              amountDue { value }
              customer  { name }
            }
          }
        }
      }
    }
  `;
  const data  = await gqlRequest(token, query, { businessId, invoiceNumber });
  const edges = data?.data?.business?.invoices?.edges;
  if (!edges?.length) return null;
  return edges[0].node;
}

// Wave InvoicePaymentCreateManualInput fields:
// invoiceId, paymentAccountId, amount, paymentDate, paymentMethod, exchangeRate, memo
export async function createManualPayment(token, input) {
  const mutation = `
    mutation ($input: InvoicePaymentCreateManualInput!) {
      invoicePaymentCreateManual(input: $input) {
        didSucceed
        inputErrors { message code path }
      }
    }
  `;
  debugLog("Payment input being sent:", JSON.stringify(input, null, 2));
  const data = await gqlRequest(token, mutation, { input });
  debugLog("Payment response:", JSON.stringify(data, null, 2));
  return data.data.invoicePaymentCreateManual;
}




// import axios from "axios";
// import waveConfig from "../config/wave.config.js";

// const { GQL_URL, TOKEN_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = waveConfig;

// export async function exchangeToken(code) {
//   const res = await axios.post(
//     TOKEN_URL,
//     new URLSearchParams({
//       grant_type: "authorization_code",
//       code,
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       redirect_uri: REDIRECT_URL,
//     }),
//     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//   );
//   return res.data.access_token;
// }

// async function gqlRequest(token, query, variables = {}) {
//   const res = await axios.post(
//     GQL_URL,
//     { query, variables },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return res.data;
// }

// export async function getBusinesses(token) {
//   const query = `
//     query {
//       businesses(page: 1, pageSize: 20) {
//         edges {
//           node {
//             id
//             name
//             isPersonal
//             organizationalType
//             currency { code symbol }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query);
//   const businesses = data.data.businesses.edges.map((e) => e.node);
//   businesses.forEach((b) => console.log(`Business: ${b.name} → ID: ${b.id}`));
//   return businesses;
// }

// export async function getCustomers(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         customers(page: 1, pageSize: 2000) {
//           edges {
//             node { id name email }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("Customers raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.customers?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// export async function getProducts(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         products(page: 1, pageSize: 100) {
//           edges {
//             node { id name isSold }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("Products raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.products?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// // ── NEW: Sales taxes fetch karo ──────────────────────────────────────
// export async function getSalesTaxes(token, businessId) {
//   const query = `
//     query($businessId: ID!) {
//       business(id: $businessId) {
//         salesTaxes(page: 1, pageSize: 2000) {
//           edges {
//             node {
//               id
//               name
//               abbreviation
//               taxNumber
//               rate
//               isCompound
//             }
//           }
//         }
//       }
//     }
//   `;
//   const data = await gqlRequest(token, query, { businessId });
//   console.log("SalesTaxes raw response:", JSON.stringify(data, null, 2));

//   const edges = data?.data?.business?.salesTaxes?.edges;
//   if (!edges) return [];
//   return edges.map((e) => e.node);
// }

// export async function createInvoice(token, input) {
//   const mutation = `
//     mutation ($input: InvoiceCreateInput!) {
//       invoiceCreate(input: $input) {
//         didSucceed
//         inputErrors { message code path }
//         invoice {
//           id
//           invoiceNumber
//           status
//           viewUrl
//           total { value currency { symbol } }
//           customer { name }
//         }
//       }
//     }
//   `;
//   console.log('Invoice input being sent:', JSON.stringify(input, null, 2));
//   const data = await gqlRequest(token, mutation, { input });
//   console.log('Invoice response:', JSON.stringify(data, null, 2));
//   return data.data.invoiceCreate;
// }