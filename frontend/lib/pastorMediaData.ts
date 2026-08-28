/**
 * Pastor Media Dataset — Kingdom of Christ Ministries
 * Exclusively contains Sri. KURRA KRISTHU RAJU (Vice President, Telangana United Christian Synod - TUCS) images and video.
 */

export interface PastorMediaItem {
  id: string;
  type: "image" | "video";
  title: string;
  titleTe: string;
  titleHi: string;
  subtitle: string;
  subtitleTe: string;
  subtitleHi: string;
  description: string;
  descriptionTe: string;
  descriptionHi: string;
  scriptureRef?: string;
  scriptureText?: string;
  scriptureTextTe?: string;
  scriptureTextHi?: string;
  category: "Pastoral Anointing" | "Synod Leadership" | "Congregational Blessing" | "Pastoral Care";
  url: string;
  thumbnailUrl: string;
  videoUrl?: string;
  duration?: string;
  branchName: string;
  date: string;
  tags: string[];
}

export const PASTOR_MEDIA_ITEMS: PastorMediaItem[] = [
  {
    id: "pastor-item-1",
    type: "image",
    title: "Telangana United Christian Synod (TUCS) Elects New Executive Committee — Official Press Announcement",
    titleTe: "తెలంగాణ యునైటెడ్ క్రిస్టియన్ సైనాడ్ (TUCS) నూతన కార్యవర్గ ఎన్నిక — అధికారిక పత్రికా ప్రకటన",
    titleHi: "तेलंगाना यूनाइटेड क्रिश्चियन सिनॉड (TUCS) नई कार्यकारिणी का चुनाव — आधिकारिक समाचार",
    subtitle: "Sri. KURRA KRISTHU RAJU appointed as Vice President in TUCS Executive Committee",
    subtitleTe: "TUCS కార్యవర్గంలో వైస్ ప్రెసిడెంట్‌గా ప్రమాణ స్వీకారం చేసిన శ్రీ కుర్ర క్రిస్తు రాజు గారు",
    subtitleHi: "TUCS कार्यकारिणी में उपाध्यक्ष (Vice President) के रूप में श्री कुर्रा क्रिस्तु राजू का शपथ ग्रहण",
    description: "Official press coverage of the Telangana United Christian Synod (TUCS) electing its 22-member Executive Committee for a two-year term at MB Church Bhavan, Malakpet, with Sri. KURRA KRISTHU RAJU taking charge as Vice President.",
    descriptionTe: "మలక్‌పేట ఎంబీ చర్చ్ భవన్‌లో జరిగిన సమావేశంలో తెలంగాణ యునైటెడ్ క్రిస్టియన్ సైనాడ్ (TUCS) వైస్ ప్రెసిడెంట్‌గా శ్రీ కుర్ర క్రిస్తు రాజు గారి ప్రమాణ స్వీకారోత్సవ పత్రికా ప్రకటన.",
    descriptionHi: "मलकपेट स्थित एमबी चर्च भवन में आयोजित समारोह में तेलंगाना यूनाइटेड क्रिश्चियन सिनॉड (TUCS) के उपाध्यक्ष (Vice President) के रूप में श्री कुर्रा क्रिस्तु राजू का शपथ ग्रहण समाचार।",
    scriptureRef: "Romans 13:1",
    scriptureText: "Let everyone be subject to the governing authorities, for there is no authority except that which God has established.",
    scriptureTextTe: "ప్రతివాడును పై అధికారులకు లోబడియుండవలెను; ఏలయనగా దేవునివలన కలిగినది తప్ప మరి ఏ అధికారమును లేదు.",
    scriptureTextHi: "हर एक व्यक्ति प्रधान अधिकारियों के आधीन रहे; क्योंकि कोई अधिकार ऐसा नहीं जो परमेश्वर की ओर से न हो।",
    category: "Synod Leadership",
    url: "/gallery/pastor/1.0.jpeg",
    thumbnailUrl: "/gallery/pastor/1.0.jpeg",
    branchName: "Malakpet",
    date: "August 2026",
    tags: ["Sri. KURRA KRISTHU RAJU", "Vice President", "TUCS", "Telangana United Christian Synod", "Leadership", "Press Release"],
  },
  {
    id: "pastor-item-2",
    type: "image",
    title: "Sri. KURRA KRISTHU RAJU Official Appointment as Vice President — TUCS Media Report",
    titleTe: "శ్రీ కుర్ర క్రిస్తు రాజు గారికి TUCS వైస్ ప్రెసిడెంట్ నియామక పత్రం & పత్రికా నివేదిక",
    titleHi: "श्री कुर्रा क्रिस्तु राजू का TUCS उपाध्यक्ष पद पर आधिकारिक नियुक्ति पत्र एवं मीडिया रिपोर्ट",
    subtitle: "Official Letter of Appointment honoring Sri. KURRA KRISTHU RAJU as Vice President (2024–2026)",
    subtitleTe: "శ్రీ కుర్ర క్రిస్తు రాజు గారికి TUCS వైస్ ప్రెసిడెంట్‌గా రెండేళ్ల కాలపరిమితితో అధికారిక నియామక పత్రం సమర్పణ",
    subtitleHi: "श्री कुर्रा क्रिस्तु राजू को TUCS उपाध्यक्ष (2024–2026) के रूप में आधिकारिक नियुक्ति पत्र प्रदान किया गया",
    description: "Official Letter of Appointment presented to Sri. KURRA KRISTHU RAJU appointing him as Vice President of Telangana United Christian Synod (TUCS), celebrating Christian leadership unity and social welfare commitment.",
    descriptionTe: "తెలంగాణ యునైటెడ్ క్రిస్టియన్ సైనాడ్ (TUCS) వైస్ ప్రెసిడెంట్‌గా శ్రీ కుర్ర క్రిస్తు రాజు గారి నియామక పత్రం మరియు క్రైస్తవ సమాజ సేవ సంకల్పం.",
    descriptionHi: "तेलंगाना यूनाइटेड क्रिश्चियन सिनॉड (TUCS) के उपाध्यक्ष के रूप में श्री कुर्रा क्रिस्तु राजू का आधिकारिक नियुक्ति पत्र एवं जन कल्याण सेवा का संकल्प।",
    scriptureRef: "Galatians 6:9",
    scriptureText: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    scriptureTextTe: "మనం మేలుచేయుటయందు విసుకకయుందము; మనం అలయకయుంటే తగినకాలమందు పంట కోతుము.",
    scriptureTextHi: "हम भले काम करने में साहस न छोड़ें; क्योंकि यदि हम ढीले न हों, तो ठीक समय पर फल काटेंगे।",
    category: "Synod Leadership",
    url: "/gallery/pastor/2.0.jpeg",
    thumbnailUrl: "/gallery/pastor/2.0.jpeg",
    branchName: "Malakpet",
    date: "August 2026",
    tags: ["Sri. KURRA KRISTHU RAJU", "Vice President", "Appointment Letter", "TUCS", "Telangana United Christian Synod", "Welfare"],
  },
  {
    id: "pastor-item-3",
    type: "image",
    title: "Pastoral Synod Assembly & Fellowship Gathering",
    titleTe: "పాస్టరల్ సైనాడ్ సభ & ఆత్మీయ సహవాసం",
    titleHi: "पास्टोरल सिनॉड सभा एवं आत्मिक संगति",
    subtitle: "Sri. KURRA KRISTHU RAJU (Vice President, TUCS) with church bishops, ministers, and synod delegates",
    subtitleTe: "బిషప్‌లు మరియు సైనాడ్ ప్రతినిధులతో శ్రీ కుర్ర క్రిస్తు రాజు గారు (వైస్ ప్రెసిడెంట్, TUCS)",
    subtitleHi: "बिशपों और सिनॉड प्रतिनिधियों के साथ श्री कुर्रा क्रिस्तु राजू (उपाध्यक्ष, TUCS)",
    description: "Sri. KURRA KRISTHU RAJU alongside bishops and esteemed Christian leaders united on stage at MB Church Bhavan, committing to strengthen Christian unity and promote social service across Telangana.",
    descriptionTe: "దేవుని సేవకులందరితో కలిసి సమాజ సేవ మరియు సువార్త ప్రకటన కొరకు శ్రీ కుర్ర క్రిస్తు రాజు గారి సంకల్పం.",
    descriptionHi: "सभी परमेश्वर के सेवकों के साथ मिलकर समाज सेवा और सुसमाचार प्रचार के लिए श्री कुर्रा क्रिस्तु राजू का संकल्प।",
    scriptureRef: "Psalm 133:1",
    scriptureText: "How good and pleasant it is when God’s people live together in unity!",
    scriptureTextTe: "సహోదరులు ఐక్యత కలిగి నివసించుట ఎంత మేలు! ఎంత మనోహరము!",
    scriptureTextHi: "देखो, यह क्या ही भली और मनोहर बात है कि भाई आपस में मिले रहें!",
    category: "Pastoral Care",
    url: "/gallery/pastor/3.0.jpeg",
    thumbnailUrl: "/gallery/pastor/3.0.jpeg",
    branchName: "Malakpet",
    date: "August 2026",
    tags: ["Sri. KURRA KRISTHU RAJU", "Vice President", "Fellowship", "Bishops", "Synod", "Ministers"],
  },
  {
    id: "pastor-item-4",
    type: "image",
    title: "Covenant Leadership Commissioning Ceremony",
    titleTe: "నిబంధన నాయకత్వ సమర్పణ సభ",
    titleHi: "वाचा नेतृत्व समर्पण समारोह",
    subtitle: "Consecration assembly with Sri. KURRA KRISTHU RAJU, pastors, directors, and youth delegates",
    subtitleTe: "శ్రీ కుర్ర క్రిస్తు రాజు గారి ఆధ్వర్యంలో నిబంధన నాయకత్వ సమర్పణ",
    subtitleHi: "श्री कुर्रा क्रिस्तु राजू के सानिध्य में नेतृत्व समर्पण समारोह",
    description: "Grand gathering at MB Church Bhavan, Malakpet, presenting official appointment letters and certificates to executive committee members, women's wing, and youth wing in-charges with Sri. KURRA KRISTHU RAJU.",
    descriptionTe: "నూతన కార్యవర్గ సభ్యులకు నియామక పత్రాల ప్రదానం మరియు శ్రీ కుర్ర క్రిస్తు రాజు గారి ఆశీర్వాద ప్రార్థన.",
    descriptionHi: "नव-निर्वाचित पदाधिकारियों को नियुक्ति पत्र वितरण एवं श्री कुर्रा क्रिस्तु राजू द्वारा आशीष प्रार्थना।",
    scriptureRef: "2 Timothy 2:2",
    scriptureText: "And the things you have heard me say in the presence of many witnesses entrust to reliable people.",
    scriptureTextTe: "నీవు అనేకుల యెదుట నావలన వినిన సంగతులను ఇతరులకు బోధించుటకు సమర్థులైన నమ్మకమైన మనుష్యులకు అప్పగించుము.",
    scriptureTextHi: "जो बातें तू ने बहुत से गवाहों के साम्हने मुझ से सुनी हैं, उन्हें ऐसे विश्वासयोग्य मनुष्यों को सौंप दे जो औरों को भी सिखाने के योग्य हों।",
    category: "Congregational Blessing",
    url: "/gallery/pastor/4.0.jpeg",
    thumbnailUrl: "/gallery/pastor/4.0.jpeg",
    branchName: "Malakpet",
    date: "August 2026",
    tags: ["Sri. KURRA KRISTHU RAJU", "Vice President", "Commissioning", "Synod", "Leadership", "Certificate Presentation"],
  },
  {
    id: "pastor-item-5",
    type: "video",
    title: "Sri. KURRA KRISTHU RAJU Ministry Message & Blessing Video",
    titleTe: "శ్రీ కుర్ర క్రిస్తు రాజు గారి ప్రత్యేక పరిచర్య సందేశం మరియు ఆశీర్వాద వీడియో",
    titleHi: "श्री कुर्रा क्रिस्तु राजू विशेष सेवकाई संदेश एवं आशीष वीडियो",
    subtitle: "Exclusive video recording of Sri. KURRA KRISTHU RAJU's pastoral message & prayer",
    subtitleTe: "శ్రీ కుర్ర క్రిస్తు రాజు గారి ప్రత్యక్ష ప్రార్థన మరియు ఆశీర్వాద వీడియో",
    subtitleHi: "श्री कुर्रा क्रिस्तु राजू की विशेष प्रार्थना एवं आशीष वीडियो",
    description: "Exclusive live ministry video recording capturing Sri. KURRA KRISTHU RAJU's prayer, message, and congregation fellowship blessings.",
    descriptionTe: "శ్రీ కుర్ర క్రిస్తు రాజు గారి ప్రత్యక్ష ప్రార్థన, దైవ సందేశం మరియు ఆశీర్వాదాలు కలిగిన ప్రత్యేక వీడియో.",
    descriptionHi: "श्री कुर्रा क्रिस्तु राजू की प्रार्थना, संदेश और आशीष से भरा हुआ विशेष वीडियो।",
    scriptureRef: "Numbers 6:24-26",
    scriptureText: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
    scriptureTextTe: "యెహోవా నిన్ను ఆశీర్వదించి నిన్ను కాపాడును గాక; యెహోవా తన సన్నిధిని నీకు ప్రకాశింపజేసి నిన్ను కరుణించును గాక.",
    scriptureTextHi: "यहोवा तुझे आशीष दे और तेरी रक्षा करे; यहोवा तुझ पर अपने मुख का प्रकाश चमकाए और तुझ पर अनुग्रह करे।",
    category: "Pastoral Anointing",
    url: "/gallery/pastor/pastor-video.mp4",
    videoUrl: "/gallery/pastor/pastor-video.mp4",
    thumbnailUrl: "/gallery/pastor/3.0.jpeg",
    duration: "Full Video",
    branchName: "Malakpet",
    date: "August 2026",
    tags: ["Sri. KURRA KRISTHU RAJU", "Vice President", "Pastor Video", "Blessing", "Ministry Gathering", "Anointing"],
  },
];
