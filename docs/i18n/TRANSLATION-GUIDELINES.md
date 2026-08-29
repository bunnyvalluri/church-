# Translation Guidelines

Standards for translating content into Telugu and Hindi for the Kingdom of Christ Ministries platform.

---

## 1. Natural & Grammatically Correct Localization
- Avoid mechanical word-for-word machine transliterations.
- Use natural honorifics and respectful verb forms standard in church liturgy and community communications (e.g. Telugu: `స్వాగతం`, `మంగళకరమైన`, `ఆరాధన`; Hindi: `स्वागत है`, `प्रार्थना`, `आराधना`).

---

## 2. Proper Names & Official Terms
- **Organization Name**: `"Kingdom of Christ Ministries"` should remain official. In Telugu: `కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్`, in Hindi: `किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज़`.
- **Senior Pastor Name**: `"Bishop Kurra Kristhu Raju"` (Telugu: `బిషప్ కుర్రా క్రీస్తు రాజు`, Hindi: `बिशप कुर्रा क्रिस्तु राजू`).
- **Branch Locations**:
  - Shapur Nagar: `షాపూర్ నగర్` / `शापूर नगर`
  - Subhash Nagar: `సుభాష్ నగర్` / `सुभाष नगर`
  - Bahadurpally: `బహదూర్‌పల్లి` / `बहादुरपल्ली`

---

## 3. Separation of Static UI vs. Database Content
- **Static UI Strings**: Headings, navigation items, buttons, form placeholders, error/success toasts, dialogs, and labels must always come from `@/i18n`.
- **Database Records**: Dynamic entries (e.g. member full names, transaction IDs, specific sermon notes) remain stored as user-submitted records and are rendered directly without artificial translation. Multilingual database fields should use JSON schemas (`{ en: string, te?: string, hi?: string }`).

---

## 4. Punctuation and Unicode Standards
- Always ensure valid UTF-8 Unicode encoding.
- Do not use raw HTML or unescaped character entities inside translation dictionary string values.
