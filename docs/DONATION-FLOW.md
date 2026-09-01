# End-to-End Donation Flow

## 1. Member Giving Flow (`/member/give`)

```
Step 1: Enter Details
├── Select Purpose (Tithe, Online Offering, Building Fund, Missions, Benevolence, Special)
├── Select Branch (Shapur Nagar, Subhash Nagar, Bahadurpally)
├── Select or Enter Amount (₹500, ₹1000, ₹2500, ₹5000, ₹10000, or Custom)
├── Provide / Prefill Donor Info (Name, Email, Phone)
└── Click "Generate Dynamic QR & Pay"

Step 2: Backend Processing
├── Resolve Authenticated Member ID from Session Token
├── Validate Amount against DB Church Settings bounds (Min ₹1, Max ₹5,00,000)
├── Call Razorpay API to create official Order ID (Integer Paise)
├── Create DB DonationSession & Donation records in PROCESSING status
├── Generate Dynamic UPI URI & high-res SVG/Canvas QR Code
└── Return safe payload to client

Step 3: Scan & Pay
├── Displays Dynamic QR with real-time 15-minute countdown
├── Quick-launch deep links for UPI Apps: GPay, PhonePe, Paytm, BHIM, FamApp
├── Donor completes transfer in mobile UPI application
└── Frontend polls `/api/payments/status/[id]` every 4-5 seconds + listens to Socket.IO

Step 4: Verification & Settlement
├── Option A: Authoritative Webhook arrives -> Atomic DB settle -> Socket triggers client redirect
├── Option B: User clicks "I've Paid - Verify Now" -> Calls `/api/payments/verify` -> Server confirms with gateway
└── Verifiable PDF Receipt generated at `/give/receipt/[donationId]`
```

---

## 2. NGO Donation Flow (`/ngo/donations`)

The NGO donation portal uses the **exact same production payment service** as Member Giving. Both routes share:
- Unified `/api/payments/create-order`
- Unified `/api/payments/verify`
- Unified `/api/webhooks/razorpay`
- Shared Receipt Engine & Ledger Accounting
