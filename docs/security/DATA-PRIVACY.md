# KCM Assistant Data Privacy & Protection Policy

This document defines user data privacy, confidentiality, and data minimization standards for the **KCM Assistant** AI subsystem.

---

## 1. Prayer Request Privacy

- **High-Sensitivity Classification**: Personal prayer requests are classified as **Confidential Personal Data**.
- **Ownership Scoping**: A member's prayer requests can only be queried if `authUser.uid === prayerRequest.memberId`.
- **No Cross-User Leakage**: An unauthenticated or unauthorized user querying `"Show me recent prayer requests"` receives only general public guidance on how to submit a prayer request; private requests from other members are never retrieved.
- **Anonymous Submission**: Members can flag prayer requests as `isAnonymous: true`.

---

## 2. Conversation Data Isolation

- **Ephemeral Context**: Chat history is kept in memory during the active session and is not stored in a shared global training memory.
- **No Model Training**: KCM Assistant uses enterprise API endpoints with zero-data-retention / no-training agreements.
- **Data Minimization**: Prompts only include the minimum necessary context (up to 3 recent events and 3 recent sermons).

---

## 3. Financial & Payment Privacy

- The chatbot **never** requests or stores card numbers, CVVs, netbanking passwords, or UPI PINs.
- For all donations, the chatbot provides the official UPI ID (`kcm.kristhraj2004-1@okicici`) or directs the user to the verified `/ngo/donations` portal.
