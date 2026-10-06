import { getInvoices, getAccounts, createManualPayment, getInvoiceByNumber } from "../services/wave.service";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const VALID_METHODS = ["BANK_TRANSFER", "CASH", "CHEQUE","CREDIT_CARD", "OTHER", "PAYPAL", "UNSPECIFIED"]

//Get invoices list for payment
export const listInvoices = (req, res) => {
    const { businessId } = req.params
    const page     = parseInt(req.query.page)     || 1
    const pageSize = parseInt(req.query.pageSize) || 50
    try {
        const data = await getInvoices(req.session.accessToken, businessId, page, pageSize)
        res.json(data)
    } catch (err) {
        console.error("listInvoices error:", err.respons?.data || err.message )
        res.status(500).json({ error : "Failed To fetch invoices"})
    }
}

// Get account linst for payment account selection
export const listAccount = (req, res) => {
  try {
        const accounts = await getAccounts(req.session.accessToken, businessId)
        res.json(accounts)
    } catch (err) {
        console.error("listAccounts error : ", err.response?.data || err.message)
        res.status(500).json({ error : "Failed to accounts"})
    }
}

export const applyPayment = (req, res) => {
    const { invoiceId, paymentDate, amount, accountId, memo, sendReceipt } = req.body

    if(!invoiceId || !paymentDate || !amount || !accountId) {
        return res.status(400).json({
            error: "invoiceId, paymentDate, amount, accountId are required",
        })
    }
    try {
        const input = {
            invoiceId,
            paymentDate,
            amount :       parseFloat(amount),
            accountId,
            ...(memo       && { memo }),
            ...(sendReceipt !== undefined && { sendReceipt : Boolean(sendReceipt)}),
        }

        const result = await createManualPayment(req.session.accessToken, input)

        res.json({
            success : result.didSucceed,
            payment : result.payment,
            error   : result.inputErrors,
        })
    } catch (err) {
        console.error("applyPayment error : ", err.responseN?.data || err.message)
        res.status(500).json({ error :  "Failed to apply payment" })
    }
}

export const bulkApplyPayment = (req, res) => {
    const { payments } = req.body

    if(!payments?.length) {
        return res.status(400).json({ error : "payment array required "})
    }

    const results = []
    for(const p of payments){
        try {
            const input = {
                invoiceId   :  p.invoiceId,
                paymentDate :  p.paymentDate,
                amount      :  parseFloat(p.amount),
                accountId   :  p.accountId,
                ...(p.memo    && { memo})   
            }
        } catch (error) {
            
        }
    }
}