# 4-Step Donation Flow Architecture

The KCM Giving System implements an intuitive, accessibility-compliant 4-step wizard at `/ngo/donations` and `/give`.

---

## Step 1: Donation Amount & Purpose
- **Presets**: ₹500, ₹1,000, ₹2,000, ₹5,000, ₹10,000, or Custom Amount.
- **Quick Increments**: `+₹500`, `+₹1,000`, `+₹5,000`.
- **Purpose Selection**: Tithe, General Offering, Building Fund, Missions, Benevolence / Charity, Special Offering.
- **Branch Selection**: Shapur Nagar, Subhash Nagar, Bahadurpally, or General Headquarters.
- **Frequency Switcher**: One-Time Gift vs Recurring Monthly Partner.

---

## Step 2: Donor Information & Tax Exemption
- **Fields**: Full Name, Email Address, Phone Number (10–15 digits international format).
- **Anonymous Giver Toggle**: Masks name on public walls and reports.
- **80G Tax Exemption Toggle**: Prompts for mandatory PAN card number for verified tax exemption compliance.
- **Prayer Request / Note**: Optional text field for pastoral prayer coverage.

---

## Step 3: Payment Gateway & Dynamic UPI QR
- **Dynamic UPI QR Code**: High-resolution generated QR code containing the exact amount, merchant payee VPA (`kcm.kristhraj2004-1@okicici`), and unique order reference ID.
- **Mobile One-Tap UPI Intents**:
  - Google Pay (`tez://upi/pay?...`)
  - PhonePe (`phonepe://pay?...`)
  - Paytm (`paytmmp://upi/pay?...`)
  - BHIM (`upi://pay?...`)
- **Razorpay Standard Checkout Trigger**:
  - Allows paying with Debit/Credit Cards (Visa, Mastercard, RuPay), NetBanking (50+ banks), UPI apps, and Wallets.
- **Live Countdown Timer**: 10:00 countdown indicating QR code validity.
- **Active Real-Time Listener**: Socket.IO room subscription + 3-second database polling.

---

## Step 4: Official Verified Receipt
- **Receipt Details**:
  - Receipt Number (`KCM-REC-XXXXXXXX`)
  - Donation ID
  - Gateway Transaction ID / UTR
  - Amount in INR
  - Date & Timestamp
  - Donor Name & Purpose
  - 80G Tax Exempt Badge (if requested)
- **Donor Actions**:
  - **Download PDF**: Direct high-res printable 80G tax receipt PDF (`/api/receipts/[id]/pdf`).
  - **Print Receipt**: Triggers system print dialogue.
  - **Share Receipt**: Web Share API / Copy Link.
  - **Email Receipt**: Triggers transactional email re-dispatch.
  - **Donate Again**: Resets wizard for another contribution.
