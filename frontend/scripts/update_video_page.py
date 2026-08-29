import os

def main():
    target_file = r'c:\K.C.M-Portal\frontend\app\ngo\videos\page.tsx'
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update MediaItem category type
    old_type = 'category: "hospital" | "ashramam" | "disabled";'
    new_type = 'category: "hospital" | "ashramam" | "disabled" | "charity";'
    if old_type in content:
        content = content.replace(old_type, new_type)

    # 2. Update YOUTUBE_ITEMS
    new_yt_items = '''  {
    id: "yt-disabled-secunderabad-1",
    title: "Home for the Disabled (Secunderabad) Care & Aid Drive",
    description: "Live coverage of KCM provisions, nutritious meals, clothing, and comfort distribution at Home for the Disabled, Secunderabad.",
    source: "yt",
    videoId: "pnvJ8UDfgCg",
    url: "https://www.youtube.com/embed/pnvJ8UDfgCg?si=RQjnw64iu75PeGqc",
    thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0001.jpg",
    category: "disabled",
    categoryLabel: "Disabled Care",
    date: "23 JUL 2026"
  },
  {
    id: "yt-disabled-secunderabad-2",
    title: "Disabled Care Relief & Provision Distribution",
    description: "Comprehensive video report on KCM volunteers serving special needs residents and elderly at Home for the Disabled, Secunderabad.",
    source: "yt",
    videoId: "3n6gPSDBMig",
    url: "https://www.youtube.com/embed/3n6gPSDBMig?si=PLHFyojYboKrxdQg",
    thumbnail: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0002.jpg",
    category: "disabled",
    categoryLabel: "Disabled Care",
    date: "23 JUL 2026"
  },
  {
    id: "yt-charity-bhoiguda-1",
    title: "Missionaries of Charity Bhoiguda Outreach",
    description: "Direct video footage of KCM compassionate care mission providing nutrition, essential care supplies, emotional support, and meals at Missionaries of Charity, Bhoiguda.",
    source: "yt",
    videoId: "wH3PiXln8Sc",
    url: "https://www.youtube.com/embed/wH3PiXln8Sc?si=8V-_Zy5R1ooAQg4W",
    thumbnail: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0008.jpg",
    category: "charity",
    categoryLabel: "Missionaries of Charity",
    date: "25 MAY 2026"
  },
  {
    id: "yt-charity-bhoiguda-2",
    title: "Missionaries of Charity Care & Meal Distribution",
    description: "KCM social service volunteers delivering wholesome meals, beddings, and compassionate care to residents at Missionaries of Charity, Secunderabad Bhoiguda.",
    source: "yt",
    videoId: "JfhkQXtQwLc",
    url: "https://www.youtube.com/embed/JfhkQXtQwLc?si=sj0CdvoIqC9-oJ6b",
    thumbnail: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0009.jpg",
    category: "charity",
    categoryLabel: "Missionaries of Charity",
    date: "25 MAY 2026"
  },
];'''

    if 'date: "17 JUN 2026"\n  }\n];' in content:
        content = content.replace('date: "17 JUN 2026"\n  }\n];', 'date: "17 JUN 2026"\n  },\n' + new_yt_items)
    elif 'date: "17 JUN 2026"\r\n  }\r\n];' in content:
        content = content.replace('date: "17 JUN 2026"\r\n  }\r\n];', 'date: "17 JUN 2026"\r\n  },\r\n' + new_yt_items)

    # 3. Add RAW_MP4_ITEMS
    sec_vids = [
        ('VID-20260723-WA0114.mp4', 'IMG-20260723-WA0001.jpg'),
        ('VID-20260723-WA0115.mp4', 'IMG-20260723-WA0002.jpg'),
        ('VID-20260723-WA0116.mp4', 'IMG-20260723-WA0003.jpg'),
        ('VID-20260723-WA0117.mp4', 'IMG-20260723-WA0004.jpg'),
        ('VID-20260723-WA0122.mp4', 'IMG-20260723-WA0005.jpg'),
        ('VID-20260723-WA0123.mp4', 'IMG-20260723-WA0006.jpg'),
        ('VID-20260723-WA0124.mp4', 'IMG-20260723-WA0007.jpg'),
        ('VID-20260723-WA0125.mp4', 'IMG-20260723-WA0008.jpg'),
        ('VID-20260723-WA0145.mp4', 'IMG-20260723-WA0009.jpg'),
        ('VID-20260723-WA0154.mp4', 'IMG-20260723-WA0010.jpg'),
        ('VID-20260723-WA0155.mp4', 'IMG-20260723-WA0011.jpg'),
        ('VID-20260723-WA0156.mp4', 'IMG-20260723-WA0012.jpg'),
        ('VID-20260723-WA0157.mp4', 'IMG-20260723-WA0013.jpg'),
        ('VID-20260723-WA0158.mp4', 'IMG-20260723-WA0014.jpg'),
        ('VID-20260723-WA0159.mp4', 'IMG-20260723-WA0015.jpg'),
        ('VID-20260723-WA0160.mp4', 'IMG-20260723-WA0016.jpg'),
        ('VID-20260723-WA0196.mp4', 'IMG-20260723-WA0017.jpg'),
        ('VID-20260723-WA0199.mp4', 'IMG-20260723-WA0018.jpg'),
        ('VID-20260723-WA0200.mp4', 'IMG-20260723-WA0019.jpg'),
        ('VID-20260723-WA0238.mp4', 'IMG-20260723-WA0020.jpg'),
        ('VID-20260723-WA0239.mp4', 'IMG-20260723-WA0021.jpg'),
        ('VID-20260723-WA0240.mp4', 'IMG-20260723-WA0022.jpg'),
        ('VID-20260723-WA0241.mp4', 'IMG-20260723-WA0023.jpg'),
        ('VID-20260723-WA0243.mp4', 'IMG-20260723-WA0024.jpg'),
        ('VID-20260723-WA0244.mp4', 'IMG-20260723-WA0025.jpg'),
        ('VID-20260723-WA0245.mp4', 'IMG-20260723-WA0026.jpg')
    ]

    sec_base = "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]"
    sec_entries = []
    for i, (v, img) in enumerate(sec_vids, 1):
        sec_entries.append(f'  {{ id: "mp4-dis-sec-{i}", title: "Disabled Care Secunderabad – Clip {i}", src: "{sec_base}/{v}", thumbnail: "{sec_base}/{img}", category: "disabled" as const, categoryLabel: "Disabled Care Log", date: "23 JUL 2026", clipNumber: {i}, source: "mp4" as const }},')

    moc_vids = [
        ('VID-20260825-WA0045.mp4', 'IMG-20260825-WA0008.jpg'),
        ('VID-20260825-WA0046.mp4', 'IMG-20260825-WA0009.jpg'),
        ('VID-20260825-WA0047.mp4', 'IMG-20260825-WA0010.jpg'),
        ('VID-20260825-WA0048.mp4', 'IMG-20260825-WA0011.jpg'),
        ('VID-20260825-WA0049.mp4', 'IMG-20260825-WA0012.jpg'),
        ('VID-20260825-WA0050.mp4', 'IMG-20260825-WA0013.jpg'),
        ('VID-20260825-WA0051.mp4', 'IMG-20260825-WA0014.jpg'),
        ('VID-20260825-WA0063.mp4', 'IMG-20260825-WA0015.jpg'),
        ('VID-20260825-WA0064.mp4', 'IMG-20260825-WA0016.jpg'),
        ('VID-20260825-WA0107.mp4', 'IMG-20260825-WA0018.jpg'),
        ('VID-20260825-WA0112.mp4', 'IMG-20260825-WA0019.jpg'),
        ('VID-20260825-WA0143.mp4', 'IMG-20260825-WA0020.jpg'),
        ('VID_20260825_120539457.mp4', 'IMG-20260825-WA0021.jpg'),
        ('VID_20260825_120640222.mp4', 'IMG-20260825-WA0022.jpg'),
        ('VID_20260825_120657614.mp4', 'IMG-20260825-WA0023.jpg'),
        ('VID_20260825_120805292.mp4', 'IMG-20260825-WA0024.jpg')
    ]

    moc_base = "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026"
    moc_entries = []
    for i, (v, img) in enumerate(moc_vids, 1):
        moc_entries.append(f'  {{ id: "mp4-charity-{i}", title: "Missionaries of Charity – Clip {i}", src: "{moc_base}/{v}", thumbnail: "{moc_base}/{img}", category: "charity" as const, categoryLabel: "Charity Outreach Log", date: "25 MAY 2026", clipNumber: {i}, source: "mp4" as const }},')

    all_new_mp4 = "\n  // Home for Disabled Secunderabad Drive (26 Clips)\n" + "\n".join(sec_entries) + "\n\n  // Missionaries of Charity Bhoiguda Drive (16 Clips)\n" + "\n".join(moc_entries) + "\n];"

    last_mp4_item = '{ id: "mp4-hosp-gandhi-hospital-7", title: "Gandhi Hospital Outreach - Clip 7", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260418-WA0034.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0042.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 7, source: "mp4" as const },\n];'

    if last_mp4_item in content:
        content = content.replace(last_mp4_item, '{ id: "mp4-hosp-gandhi-hospital-7", title: "Gandhi Hospital Outreach - Clip 7", src: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/VID-20260418-WA0034.mp4", thumbnail: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0042.jpg", category: "hospital" as const, categoryLabel: "Gandhi Hospital Food Log", date: "25 MAR 2026", clipNumber: 7, source: "mp4" as const },\n' + all_new_mp4)

    # 4. MP4_ITEMS descriptions
    old_mp4_items_desc = '''const MP4_ITEMS: MediaItem[] = RAW_MP4_ITEMS.map(item => ({
  ...item,
  description: item.category === "disabled"
    ? `Authentic field video recording captured live during KCM\'s Home for the Disabled Ashramam aid and provisions distribution drive on ${item.date}.`
    : item.category === "hospital"
    ? `Authentic field video recording captured live during KCM\'s ${item.categoryLabel} relief drive on ${item.date}.`
    : `Authentic video recording captured live during KCM\'s Bethany Samrakshana Ashramam grocery and provisions distribution drive on ${item.date}.`
}));'''

    new_mp4_items_desc = '''const MP4_ITEMS: MediaItem[] = RAW_MP4_ITEMS.map(item => ({
  ...item,
  description: item.category === "disabled"
    ? `Authentic field video recording captured live during KCM\'s Home for the Disabled aid and provisions distribution drive on ${item.date}.`
    : item.category === "charity"
    ? `Authentic field video recording captured live during KCM\'s Missionaries of Charity Bhoiguda care mission on ${item.date}.`
    : item.category === "hospital"
    ? `Authentic field video recording captured live during KCM\'s ${item.categoryLabel} relief drive on ${item.date}.`
    : `Authentic video recording captured live during KCM\'s Bethany Samrakshana Ashramam grocery and provisions distribution drive on ${item.date}.`
}));'''

    if old_mp4_items_desc in content:
        content = content.replace(old_mp4_items_desc, new_mp4_items_desc)

    # 5. VIDEO_TRANSLATIONS
    old_trans = '''  "yt-disabled": {
    title: { te: "దివ్యాంగుల సంరక్షణ ఆశ్రమం సందర్శన & సేవ", hi: "दिव्यांग देखभाल आश्रम सेवा एवं भेंट" },
    description: {
      te: "దివ్యాంగుల హోమ్ నివాసితులకు సౌకర్య కిట్‌లు, వెచ్చని దుప్పట్లు, బెడ్‌షీట్లు, వీల్‌చైర్లు మరియు శారీరక సహాయాన్ని అందించడం.",
      hi: "दिव्यांग गृह के निवासियों को कम्फर्ट किट, गर्म कंबल, बेडशीट, व्हीलचेयर और शारीरिक सहायता प्रदान करना।"
    }
  },
};'''

    new_trans = '''  "yt-disabled": {
    title: { te: "దివ్యాంగుల సంరక్షణ ఆశ్రమం సందర్శన & సేవ", hi: "दिव्यांग देखभाल आश्रम सेवा एवं भेंट" },
    description: {
      te: "దివ్యాంగుల హోమ్ నివాసితులకు సౌకర్య కిట్‌లు, వెచ్చని దుప్పట్లు, బెడ్‌షీట్లు, వీల్‌చైర్లు మరియు శారీరక సహాయాన్ని అందించడం.",
      hi: "दिव्यांग गृह के निवासियों को कम्फर्ट किट, गर्म कंबल, बेडशीट, व्हीलचेयर और शारीरिक सहायता प्रदान करना।"
    }
  },
  "yt-disabled-secunderabad-1": {
    title: { te: "సికింద్రాబాద్ దివ్యాంగుల హోమ్ సేవా డ్రైవ్", hi: "सिकंदराबाद दिव्यांग गृह सहायता अभियान" },
    description: {
      te: "సికింద్రాబాద్ దివ్యాంగుల హోమ్‌లోని నివాసితులకు నిత్యావసర సరుకులు, పౌష్టికాహారం, దుస్తులు మరియు సహాయ సామాగ్రి పంపిణీ ప్రత్యక్ష దృశ్యాలు.",
      hi: "सिकंदराबाद दिव्यांग गृह में रहने वालों को राशन, पौष्टिक भोजन, वस्त्र और देखभाल सामग्री वितरण का लाइव कवरेज।"
    }
  },
  "yt-disabled-secunderabad-2": {
    title: { te: "దివ్యాంగుల ఉపశమనం & సరుకుల పంపిణీ", hi: "दिव्यांग राहत एवं राशन वितरण कार्यक्रम" },
    description: {
      te: "సికింద్రాబాద్‌లోని దివ్యాంగుల కేంద్రంలో KCM వాలంటీర్ల ప్రత్యేక సేవా కార్యక్రమం మరియు సహాయ చర్యల సమగ్ర వీడియో నివేదిక.",
      hi: "सिकंदराबाद दिव्यांग केंद्र में केसीएम स्वयंसेवकों के विशेष सेवा कार्य और राहत प्रयासों की व्यापक वीडियो रिपोर्ट।"
    }
  },
  "yt-charity-bhoiguda-1": {
    title: { te: "మిషనరీస్ ఆఫ్ చారిటీ భోయిగూడ సేవా కార్యక్రమం", hi: "मिशनरीज ऑफ चैरिटी भोईगुड़ा सेवा अभियान" },
    description: {
      te: "సికింద్రాబాద్ భోయిగూడలోని మిషనరీస్ ఆఫ్ చారిటీలో పోషకాహారం, సంరక్షణ సామాగ్రి, మానసిక ధైర్యం మరియు భోజనం అందించిన KCM సేవా దృశ్యాలు.",
      hi: "सिकंदराबाद भोईगुड़ा स्थित मिशनरीज ऑफ चैरिटी में पोषण, आवश्यक देखभाल सामग्री और भोजन प्रदान करने का लाइव वीडियो।"
    }
  },
  "yt-charity-bhoiguda-2": {
    title: { te: "మిషనరీస్ ఆఫ్ చారిటీ సంరక్షణ & భోజన పంపిణీ", hi: "मिशनरीज ऑफ चैरिटी देखभाल एवं भोजन वितरण" },
    description: {
      te: "భోయిగూడ మిషనరీస్ ఆఫ్ చారిటీ నివాసితులకు పరిశుభ్రమైన భోజనం, బెడ్డింగ్ మరియు ప్రేమతో కూడిన సహాయం అందించిన సామాజిక సేవ.",
      hi: "भोईगुड़ा मिशनरीज ऑफ चैरिटी के निवासियों को पौष्टिक भोजन, बिस्तर और सहायता प्रदान करने का सेवा कार्य।"
    }
  },
};'''

    if old_trans in content:
        content = content.replace(old_trans, new_trans)

    # 6. getVideoTitle
    old_get_title_te = 'if (item.id.startsWith("mp4-dis-")) return `దివ్యాంగుల ఆశ్రమం – క్లిప్ ${item.clipNumber || 1}`;'
    new_get_title_te = '''if (item.id.startsWith("mp4-dis-sec-")) return `సికింద్రాబాద్ దివ్యాంగుల సేవ – క్లిప్ ${item.clipNumber || 1}`;
    if (item.id.startsWith("mp4-charity-")) return `మిషనరీస్ ఆఫ్ చారిటీ – క్లిప్ ${item.clipNumber || 1}`;
    if (item.id.startsWith("mp4-dis-")) return `దివ్యాంగుల ఆశ్రమం – క్లిప్ ${item.clipNumber || 1}`;'''

    if old_get_title_te in content:
        content = content.replace(old_get_title_te, new_get_title_te)

    old_get_title_hi = 'if (item.id.startsWith("mp4-dis-")) return `दिव्यांग आश्रम – क्लिप ${item.clipNumber || 1}`;'
    new_get_title_hi = '''if (item.id.startsWith("mp4-dis-sec-")) return `सिकंदराबाद दिव्यांग सेवा – क्लिप ${item.clipNumber || 1}`;
    if (item.id.startsWith("mp4-charity-")) return `मिशनरीज ऑफ चैरिटी – क्लिप ${item.clipNumber || 1}`;
    if (item.id.startsWith("mp4-dis-")) return `दिव्यांग आश्रम – क्लिप ${item.clipNumber || 1}`;'''

    if old_get_title_hi in content:
        content = content.replace(old_get_title_hi, new_get_title_hi)

    # 7. getVideoDescription
    old_desc_te = 'if (item.category === "disabled") return `${item.date}న KCM దివ్యాంగుల సంరక్షణ ఆశ్రమం సేవా కార్యక్రమంలో ప్రత్యక్షంగా రికార్డ్ చేసిన వీడియో.`;'
    new_desc_te = '''if (item.category === "charity") return `${item.date}న KCM మిషనరీస్ ఆఫ్ చారిటీ భోయిగూడ సేవా కార్యక్రమంలో ప్రత్యక్షంగా రికార్డ్ చేసిన వీడియో.`;
    if (item.category === "disabled") return `${item.date}న KCM దివ్యాంగుల సంరక్షణ కార్యక్రమంలో ప్రత్యక్షంగా రికార్డ్ చేసిన వీడియో.`;'''

    if old_desc_te in content:
        content = content.replace(old_desc_te, new_desc_te)

    old_desc_hi = 'if (item.category === "disabled") return `${item.date} को केसीएम दिव्यांग देखभाल आश्रम सहायता अभियान के दौरान लाइव रिकॉर्ड किया गया वीडियो।`;'
    new_desc_hi = '''if (item.category === "charity") return `${item.date} को केसीएम मिशनरीज ऑफ चैरिटी भोईगुड़ा सेवा अभियान के दौरान लाइव रिकॉर्ड किया गया वीडियो।`;
    if (item.category === "disabled") return `${item.date} को केसीएम दिव्यांग देखभाल सहायता अभियान के दौरान लाइव रिकॉर्ड किया गया वीडियो।`;'''

    if old_desc_hi in content:
        content = content.replace(old_desc_hi, new_desc_hi)

    # 8. getCategoryDisplayName
    old_cat_te = 'if (cat === "disabled" || cat.includes("Disabled") || cat.includes("దివ్యాంగుల")) return "దివ్యాంగుల సంరక్షణ";'
    new_cat_te = '''if (cat === "charity" || cat.includes("Charity") || cat.includes("చారిటీ")) return "మిషనరీస్ ఆఫ్ చారిటీ";
    if (cat === "disabled" || cat.includes("Disabled") || cat.includes("దివ్యాంగుల")) return "దివ్యాంగుల సంరక్షణ";'''

    if old_cat_te in content:
        content = content.replace(old_cat_te, new_cat_te)

    old_cat_hi = 'if (cat === "disabled" || cat.includes("Disabled")) return "दिव्यांग देखभाल";'
    new_cat_hi = '''if (cat === "charity" || cat.includes("Charity")) return "मिशनरीज ऑफ चैरिटी";
    if (cat === "disabled" || cat.includes("Disabled")) return "दिव्यांग देखभाल";'''

    if old_cat_hi in content:
        content = content.replace(old_cat_hi, new_cat_hi)

    # 9. filterCategory state type
    old_filter_state = 'const [filterCategory, setFilterCategory] = useState<"all" | "yt" | "mp4" | "hospital" | "ashramam" | "disabled">("all");'
    new_filter_state = 'const [filterCategory, setFilterCategory] = useState<"all" | "yt" | "mp4" | "hospital" | "ashramam" | "disabled" | "charity">("all");'
    if old_filter_state in content:
        content = content.replace(old_filter_state, new_filter_state)

    # 10. playlistItems & filteredShowcaseMedia
    old_playlist = 'if (filterCategory === "disabled") return ALL_MEDIA_DATABASE.filter(m => m.category === "disabled");'
    new_playlist = 'if (filterCategory === "disabled") return ALL_MEDIA_DATABASE.filter(m => m.category === "disabled");\n    if (filterCategory === "charity") return ALL_MEDIA_DATABASE.filter(m => m.category === "charity");'
    if old_playlist in content:
        content = content.replace(old_playlist, new_playlist)

    old_showcase = 'else if (filterCategory === "disabled") items = items.filter(m => m.category === "disabled");'
    new_showcase = 'else if (filterCategory === "disabled") items = items.filter(m => m.category === "disabled");\n    else if (filterCategory === "charity") items = items.filter(m => m.category === "charity");'
    if old_showcase in content:
        content = content.replace(old_showcase, new_showcase)

    # 11. handleSelectCategory
    old_handler_sig = 'const handleSelectCategory = (cat: "all" | "yt" | "mp4" | "hospital" | "ashramam" | "disabled") => {'
    new_handler_sig = 'const handleSelectCategory = (cat: "all" | "yt" | "mp4" | "hospital" | "ashramam" | "disabled" | "charity") => {'
    if old_handler_sig in content:
        content = content.replace(old_handler_sig, new_handler_sig)

    old_handler_body = 'else if (cat === "disabled") items = ALL_MEDIA_DATABASE.filter(m => m.category === "disabled");'
    new_handler_body = 'else if (cat === "disabled") items = ALL_MEDIA_DATABASE.filter(m => m.category === "disabled");\n    else if (cat === "charity") items = ALL_MEDIA_DATABASE.filter(m => m.category === "charity");'
    if old_handler_body in content:
        content = content.replace(old_handler_body, new_handler_body)

    # 12. vT default translations
    old_vt = 'filterDisabled: "Disabled Care",'
    new_vt = 'filterDisabled: "Disabled Care",\n    filterCharity: "Missionaries of Charity",'
    if old_vt in content:
        content = content.replace(old_vt, new_vt)

    # 13. Add filter button in the UI
    charity_button = '''              {/* 6. Missionaries of Charity */}
              <button
                onClick={() => handleSelectCategory("charity")}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all w-full lg:w-auto ${
                  filterCategory === "charity"
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    filterCategory === "charity" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400"
                  }`}>
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{vT.filterCharity || "Missionaries of Charity"}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                  filterCategory === "charity" ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {ALL_MEDIA_DATABASE.filter(m => m.category === "charity").length}
                </span>
              </button>'''

    disabled_button_end = 'ALL_MEDIA_DATABASE.filter(m => m.category === "disabled").length}\n                </span>\n              </button>'
    if disabled_button_end in content:
        content = content.replace(disabled_button_end, disabled_button_end + '\n\n' + charity_button)

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated frontend/app/ngo/videos/page.tsx successfully!")

if __name__ == '__main__':
    main()
