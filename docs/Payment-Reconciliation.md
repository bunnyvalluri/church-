# Financial Payment Reconciliation Guide

## 1. Overview

Payment reconciliation ensures complete consistency between the **Razorpay Payment Gateway ledger** and the **KCM PostgreSQL database**.

---

## 2. Automated Discrepancy Detection

The platform provides a dedicated reconciliation engine accessible at:
`GET /api/admin/finance/reconcile`

The scanner checks all pending and processing transactions against the Razorpay Payments API and categorizes discrepancies:

| Discrepancy Type | Condition | Action |
|---|---|---|
| `GATEWAY_PAID_DB_PENDING` | Razorpay status is `captured` but database status is `PENDING` | Trigger automated `RECONCILE_CAPTURE` to finalize session and issue receipt |
| `GATEWAY_FAILED_DB_COMPLETED` | Razorpay status is `failed` but DB shows `COMPLETED` | Flag for immediate finance review |
| `AMOUNT_MISMATCH` | Captured amount in paise differs from DB session amount | Block and flag for administrative audit |
| `REFUND_MISMATCH` | Gateway shows refund not registered in database ledger | Create adjusting ledger outflow |

---

## 3. Reconciliation Execution API

Finance administrators can reconcile transactions via:
`POST /api/admin/finance/reconcile`

```json
{
  "donationId": "clxx12345678",
  "action": "RECONCILE_CAPTURE",
  "reason": "Settled via automated reconciliation scan"
}
```

Every reconciliation action writes an immutable entry into `audit_logs`.
