import * as XLSX from "xlsx";
import { fetchInvoices, flattenInvoicesForExcel } from "../services/export.service.js";

// POST /api/export/filter
// body: { start_date, end_date, business_id, api_token? }
// api_token optional hai — agar nahi diya to already-logged-in session ka token use hota hai.
export async function filterInvoices(req, res) {
  const { start_date, end_date, business_id } = req.body;
  const apiToken = req.body.api_token?.trim() || req.session?.accessToken;

  if (!start_date || !end_date || !business_id) {
    return res.status(400).json({
      message: "start_date, end_date, business_id are required",
    });
  }
  if (!apiToken) {
    return res.status(401).json({
      message: "Not connected. Please sign in or provide an API token.",
    });
  }

  try {
    const edges = await fetchInvoices(start_date, end_date, business_id, apiToken);

    if (!edges.length) {
      return res.status(404).json({ message: "No invoices found in selected range." });
    }

    res.json({ edges });
  } catch (err) {
    console.error("filterInvoices error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch invoices. Check token / business ID." });
  }
}

// POST /api/export/download
// body: { start_date, end_date, business_id, api_token? }
export async function downloadExcel(req, res) {
  const { start_date, end_date, business_id } = req.body;
  const apiToken = req.body.api_token?.trim() || req.session?.accessToken;

  if (!start_date || !end_date || !business_id) {
    return res.status(400).json({
      message: "start_date, end_date, business_id are required",
    });
  }
  if (!apiToken) {
    return res.status(401).json({
      message: "Not connected. Please sign in or provide an API token.",
    });
  }

  try {
    const edges = await fetchInvoices(start_date, end_date, business_id, apiToken);

    if (!edges.length) {
      return res.status(404).json({ message: "No invoices found in selected range." });
    }

    const flatData = flattenInvoicesForExcel(edges);

    const worksheet = XLSX.utils.json_to_sheet(flatData, {
      cellDates: true,
      dateNF: "yyyy-mm-dd",
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      cellDates: true,
      dateNF: "yyyy-mm-dd",
    });

    const filename = `wave_invoices_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    console.error("downloadExcel error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to generate Excel file." });
  }
}
