
import { getBusinesses, getCustomers, getProducts, getSalesTaxes } from "../services/wave.service.js"
import { debugLog } from "../utils/logger.js";

export async function listBusinesses(req, res) {
  try {
    const businesses = await getBusinesses(req.session.accessToken);
    res.json(businesses);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
}

export async function listCustomers(req, res) {
  try {
    debugLog("Customers fetch — businessId:", req.params.businessId);
    const customers = await getCustomers(req.session.accessToken, req.params.businessId);
    res.json(customers);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
}

export async function listProducts(req, res) {
  try {
    debugLog("Products fetch — businessId:", req.params.businessId);
    const products = await getProducts(req.session.accessToken, req.params.businessId);
    res.json(products);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}


export async function listSalesTaxes(req, res) {
  try {
    const taxes = await getSalesTaxes(req.session.accessToken, req.params.businessId);
    res.json(taxes);
  } catch (err) {
    console.error("listSalesTaxes error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch sales taxes" });
  }
}