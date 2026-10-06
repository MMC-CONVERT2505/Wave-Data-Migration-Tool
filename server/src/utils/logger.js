// Sirf development me print karta hai. Production me customer/invoice/payment
// jaisa data logs me nahi jaana chahiye.
export function debugLog(...args) {
  if (process.env.NODE_ENV !== "production") console.log(...args);
}
