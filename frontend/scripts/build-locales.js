const fs = require('fs');
const path = require('path');

// Read raw translations
const transFile = fs.readFileSync(path.join(__dirname, '../lib/translations.ts'), 'utf8');

const teAdminTitles = {
  'Members Directory': 'సభ్యుల డైరెక్టరీ',
  'Member Registry': 'సభ్యుల రిజిస్ట్రీ',
  'Executive Analytics Dashboard': 'ఎగ్జిక్యూటివ్ అనలిటిక్స్ డ్యాష్‌బోర్డ్',
  'Believers Registry': 'విశ్వాసుల రిజిస్ట్రీ',
  'Believer Fellowship Groups': 'విశ్వాసుల సహవాస సమూహాలు',
  'Member Groups & Fellowships': 'సభ్యుల గ్రూపులు & సహవాసాలు',
  'Prayer Requests Desk': 'ప్రార్థన అభ్యర్థనల విభాగం',
  'Family & Household Management': 'కుటుంబ & గృహ నిర్వహణ',
  'User Accounts Directory': 'యూజర్ ఖాతాల డైరెక్టరీ',
  'Security & Audit Logs': 'భద్రత & ఆడిట్ లాగ్‌లు',
  'Roles & Privilege Hierarchy': 'పాత్రలు & అనుమతుల వ్యవస్థ',
  'Permissions Control Matrix': 'అనుమతుల నియంత్రణ మాట్రిక్స్',
  'Platform Settings & Configuration': 'ప్లాట్‌ఫారమ్ సెట్టింగ్‌లు & కాన్ఫిగరేషన్',
  'General Church Parameters': 'సాధారణ చర్చి పారామితులు',
  'NGO Volunteers Roster': 'ఎన్‌జీవో వాలంటీర్ల జాబితా',
  'Outreach Projects & Campaigns': 'సేవా ప్రాజెక్టులు & ప్రచారాలు',
  'NGO & Community Outreach Operations': 'ఎన్‌జీవో & కమ్యూనిటీ సేవా కార్యకలాపాలు',
  'Field Photos & Impact Video Media': 'క్షేత్రస్థాయి ఫోటోలు & ప్రభావ వీడియో మీడియా',
  'Financial Transactions Log': 'ఆర్థిక లావాదేవీల లాగ్',
  'Pledges & Campaign Tracker': 'ప్రతిజ్ఞలు & ప్రచార ట్రాకర్',
  'Financial Overview & Ledgers': 'ఆర్థిక అవలోకనం & లెడ్జర్లు',
  'Donations & Tithes Ledger': 'కానుకలు & దశమభాగాల లెడ్జర్',
  'Bank Accounts & General Ledgers': 'బ్యాంక్ ఖాతాలు & జనరల్ లెడ్జర్లు',
  'Sermon Archive & Video Publishing': 'ప్రసంగాల ఆర్కైవ్ & వీడియో ప్రచురణ',
  'Content & CMS Hub': 'కంటెంట్ & సీఎంఎస్ హబ్',
  'Media Library & Asset Manager': 'మీడియా లైబ్రరీ & అసెట్ మేనేజర్',
  'Church Calendar & Events Manager': 'చర్చి క్యాలెండర్ & ఈవెంట్ల మేనేజర్',
  'Announcement Broadcasts': 'ప్రకటనల ప్రసారాలు',
  'Attendance Growth & Visitor Analytics': 'హాజరు పెరుగుదల & సందర్శకుల విశ్లేషణ',
  'Service Attendance Records': 'ఆరాధన హాజరు రికార్డులు',
  'Attendance Hub': 'హాజరు హబ్',
  'Event & Special Service Attendance': 'ఈవెంట్ & ప్రత్యేక ఆరాధన హాజరు',
  'Prayer Requests Dispatcher': 'ప్రార్థన అభ్యర్థనల డిస్పాచర్',
  'Family Unit Records': 'కుటుంబ యూనిట్ రికార్డులు',
  'Donation Ledger Workspace': 'కానుకల లెడ్జర్ వర్క్‌స్పేస్',
  'Development Pledges': 'అభివృద్ధి ప్రతిజ్ఞలు',
  'Inflow / Outflow Transactions': 'ఆదాయం / వ్యయం లావాదేవీలు',
  'Church Fund Accounts': 'చర్చి నిధి ఖాతాలు',
  'Church Attendance Records': 'చర్చి హాజరు రికార్డులు',
  'Event Check-In Terminal': 'ఈవెంట్ చెక్-ఇన్ టెర్మినల్',
  'Growth Analytics': 'అభివృద్ధి విశ్లేషణలు',
  'Preaching Sermons Library': 'ప్రసంగాల లైబ్రరీ',
  'Church Events Schedule': 'చర్చి ఈవెంట్ల షెడ్యూల్',
  'Media Gallery Library': 'మీడియా గ్యాలరీ లైబ్రరీ',
  'Sanctuary Page Editor': 'సాంక్చువరీ పేజీ ఎడిటర్',
  'Role & Permission Security Matrices': 'రోల్ & అనుమతి భద్రతా మాట్రిసెస్',
  'My Profile Details': 'నా ప్రొఫైల్ వివరాలు',
  'Public Page CMS': 'పబ్లిక్ పేజీ సీఎంఎస్'
};

const teAdminDescriptions = {
  'Organize church members into ministries, life groups, cell groups, and volunteer departments.': 'చర్చి సభ్యులను పరిచర్యలు, లైఫ్ గ్రూపులు, సెల్ గ్రూపులు మరియు వాలంటీర్ విభాగాలుగా నిర్వహించండి.',
  'Manage believer records, roles, contact information, and membership statuses.': 'విశ్వాసుల రికార్డులు, పాత్రలు, సంప్రదింపు సమాచారం మరియు సభ్యత్వ స్థితిని నిర్వహించండి.',
  'Detailed membership records, registration dates, and role verification.': 'వివరమైన సభ్యత్వ రికార్డులు, నమోదు తేదీలు మరియు పాత్ర నిర్ధారణ.',
  'Real-time operational summary across congregation, financial ledgers, and ministry activities.': 'సంఘం, ఆర్థిక లెడ్జర్లు మరియు పరిచర్య కార్యకలాపాల నిజ-సమయ కార్యకలాపాల సారాంశం.',
  'Review church profiles, promote/demote user roles, and assign security credentials.': 'చర్చి ప్రొఫైల్‌లను సమీక్షించండి, వినియోగదారు పాత్రలను అప్‌గ్రేడ్ చేయండి మరియు ఆధారాలను కేటాయించండి.',
  'Review, assign, pray for, and track testimonies submitted by believers.': 'విశ్వాసులు సమర్పించిన సాక్ష్యాలను సమీక్షించండి, కేటాయించండి, ప్రార్థించండి మరియు ట్రాక్ చేయండి.',
  'Map family trees, household heads, dependents, and anniversary tracking.': 'కుటుంబ వృక్షాలు, గృహ పెద్దలు, ఆధారపడినవారు మరియు వార్షికోత్సవాలను మ్యాప్ చేయండి.',
  'Itemized income and expense vouchers, department debits, and auditing records.': 'వస్తువుల వారీగా ఆదాయం మరియు ఖర్చు వోచర్లు, శాఖల డెబిట్లు మరియు ఆడిటింగ్ రికార్డులు.',
  'Track building pledges, faith promises, mission campaign commitments, and fulfillment rates.': 'భవన నిర్మాణ ప్రతిజ్ఞలు, విశ్వాస వాగ్దానాలు, మిషన్ ప్రచార నిబద్ధతలు మరియు నెరవేర్పు రేట్లను ట్రాక్ చేయండి.',
  'Monitor tithes, offerings, online gateways (Razorpay/Stripe), building funds, and general accounts.': 'దశమభాగాలు, కానుకలు, ఆన్‌లైన్ గేట్‌వేలు (రేజర్‌పే/స్ట్రైప్), భవన నిధులు మరియు సాధారణ ఖాతాలను పర్యవేక్షించండి.',
  'Live audit trail of online payment gateway transactions and offline cash contributions.': 'ఆన్‌లైన్ చెల్లింపు గేట్‌వే లావాదేవీలు మరియు ఆఫ్‌లైన్ నగదు విరాళాల ప్రత్యక్ష ఆడిట్ వివరాలు.',
  'Manage ministry bank accounts, petty cash reserves, razorpay payout accounts, and fund balances.': 'పరిచర్య బ్యాంక్ ఖాతాలు, పెట్టీ క్యాష్ నిల్వలు, రేజర్‌పే పేఅవుట్ ఖాతాలు మరియు నిధి నిల్వలను నిర్వహించండి.',
  'Publish sermon videos, YouTube links, series topics, speaker names, and sermon notes.': 'ప్రసంగ వీడియోలు, యూట్యూబ్ లింకులు, సిరీస్ అంశాలు, వక్త పేర్లు మరియు ప్రసంగ నోట్లను ప్రచురించండి.',
  'Edit hero section text, vision statement, service schedules, pastor biography, and contact info.': 'హీరో విభాగం వచనం, దర్శన ప్రకటన, ఆరాధన షెడ్యూల్‌లు, పాస్టర్ బయోగ్రఫీ మరియు సంప్రదింపు సమాచారాన్ని సవరించండి.',
  'Manage public website content, sermons, event calendar, announcements, and media assets.': 'పబ్లిక్ వెబ్‌సైట్ కంటెంట్, ప్రసంగాలు, ఈవెంట్ క్యాలెండర్, ప్రకటనలు మరియు మీడియా ఆస్తులను నిర్వహించండి.',
  'Cloudinary & Firebase media assets, service photos, event banners, and ministry graphics.': 'క్లౌడినరీ & ఫైర్‌బేస్ మీడియా ఆస్తులు, ఆరాధన ఫోటోలు, ఈవెంట్ బ్యానర్లు మరియు పరిచర్య గ్రాఫిక్స్.',
  'Schedule upcoming worship services, prayer vigils, conferences, youth rallies, and location details.': 'రాబోయే ఆరాధన సమయాలు, ప్రార్థన జాగరణలు, సమావేశాలు, యువజన ర్యాలీలు మరియు స్థల వివరాలను షెడ్యూల్ చేయండి.',
  'Post urgent alerts, weekly church news bulletins, and push notifications to congregation members.': 'అత్యవసర హెచ్చరికలు, వారపు చర్చి వార్తా బులెటిన్లు మరియు సంఘ సభ్యులకు పుష్ నోటిఫికేషన్‌లను పోస్ట్ చేయండి.',
  'Quarterly retention curves, first-time visitor follow-up ratios, and trend reports.': 'త్రైమాసిక నిలుపుదల గ్రాఫ్‌లు, మొదటిసారి సందర్శకుల ఫాలో-అప్ నిష్పత్తులు మరియు ట్రెండ్ నివేదికలు.',
  'Historical ledger of worship service attendances, split by main sanctuary, youth service, and kids church.': 'ప్రధాన మందిరం, యువజన సేవ మరియు పిల్లల చర్చి వారిగా విభజించబడిన ఆరాధన హాజరు చారిత్రక లెడ్జర్.',
  'Track Sunday service headcounts, midweek prayer meetings, first-time visitors, and sanctuary growth.': 'ఆదివారం ఆరాధన సంఖ్య, మధ్యవార ప్రార్థన కూటాలు, మొదటిసారి సందర్శకులు మరియు మందిర పెరుగుదలను ట్రాక్ చేయండి.',
  'Special conference attendances, baptism ceremonies, retreats, and crusade check-ins.': 'ప్రత్యేక సదస్సుల హాజరు, బాప్తిస్మ వేడుకలు, రిట్రీట్‌లు మరియు క్రూసేడ్ చెక్-ఇన్‌లు.',
  'Manage registered administrator, pastor, event manager, volunteer, and member accounts.': 'నమోదిత నిర్వాహకుడు, పాస్టర్, ఈవెంట్ మేనేజర్, వాలంటీర్ మరియు సభ్యుల ఖాతాలను నిర్వహించండి.',
  'View security event logs, failed login attempts, API token invocations, and system integrity status.': 'భద్రతా ఈవెంట్ లాగ్‌లు, విఫలమైన లాగిన్ ప్రయత్నాలు, ఏపీఐ టోకెన్ కాల్‌లు మరియు సిస్టమ్ సమగ్రతను వీక్షించండి.',
  'Assign SUPER_ADMIN, ADMIN, PASTOR, EVENT_MANAGER, FIELD_VOLUNTEER, and MEMBER roles.': 'SUPER_ADMIN, ADMIN, PASTOR, EVENT_MANAGER, FIELD_VOLUNTEER మరియు MEMBER పాత్రలను కేటాయించండి.',
  'Fine-grained feature gates, API endpoint permissions, and RBAC (Role-Based Access Control) matrix.': 'వివరణాత్మక ఫీచర్ గేట్లు, ఏపీఐ ఎండ్‌పాయింట్ అనుమతులు మరియు ఆర్బీఏసీ నియంత్రణ మాట్రిక్స్.',
  'System preferences, Church organization parameters, authentication policies, and security.': 'సిస్టమ్ ప్రాధాన్యతలు, చర్చి సంస్థ పారామితులు, ప్రామాణీకరణ విధానాలు మరియు భద్రత.',
  'Church name, address, contact phone, email server keys (Resend), SMS gateway (Twilio), and Razorpay IDs.': 'చర్చి పేరు, చిరునామా, సంప్రదింపు ఫోన్, ఈమెయిల్ సర్వర్ కీలు (Resend), SMS గేట్‌వే మరియు రేజర్‌పే ఐడీలు.',
  'Field volunteer assignments, emergency contact information, and service hours tracking.': 'క్షేత్ర వాలంటీర్ అసైన్‌మెంట్‌లు, అత్యవసర సంప్రదింపు సమాచారం మరియు సేవా గంటల ట్రాకింగ్.',
  'Manage ongoing social initiatives, budget allocation, beneficiary statistics, and progress logs.': 'కొనసాగుతున్న సామాజిక కార్యక్రమాలు, బడ్జెట్ కేటాయింపు, లబ్ధిదారుల గణాంకాలు మరియు పురోగతి లాగ్‌లను నిర్వహించండి.',
  'Oversee charity initiatives, food distribution drives, medical camps, and community relief projects.': 'సేవా కార్యక్రమాలు, ఆహార పంపిణీ డ్రైవ్‌లు, వైద్య శిబిరాలు మరియు కమ్యూనిటీ సహాయ ప్రాజెక్టులను పర్యవేక్షించండి.',
  'Gallery of outreach event photographs, field reports, and beneficiary impact testimonies.': 'సేవా కార్యక్రమాల ఛాయాచిత్రాలు, క్షేత్ర నివేదికలు మరియు లబ్ధిదారుల ప్రభావ సాక్ష్యాల గ్యాలరీ.'
};

const hiAdminTitles = {
  'Members Directory': 'सदस्य निर्देशिका',
  'Member Registry': 'सदस्य रजिस्ट्री',
  'Executive Analytics Dashboard': 'कार्यकारी विश्लेषिकी डैशबोर्ड',
  'Believers Registry': 'विश्वासियों की रजिस्ट्री',
  'Believer Fellowship Groups': 'विश्वासी संगति समूह',
  'Member Groups & Fellowships': 'सदस्य समूह और संगति',
  'Prayer Requests Desk': 'प्रार्थना अनुरोध डेस्क',
  'Family & Household Management': 'परिवार एवं गृह प्रबंधन',
  'User Accounts Directory': 'उपयोगकर्ता खाता निर्देशिका',
  'Security & Audit Logs': 'सुरक्षा और ऑडिट लॉग',
  'Roles & Privilege Hierarchy': 'भूमिकाएं और विशेषाधिकार पदानुक्रम',
  'Permissions Control Matrix': 'अनुमति नियंत्रण मैट्रिक्स',
  'Platform Settings & Configuration': 'प्लेटफ़ॉर्म सेटिंग्स और कॉन्फ़िगरेशन',
  'General Church Parameters': 'सामान्य चर्च पैरामीटर',
  'NGO Volunteers Roster': 'एनजीओ स्वयंसेवक सूची',
  'Outreach Projects & Campaigns': 'आउटरीच परियोजनाएं और अभियान',
  'NGO & Community Outreach Operations': 'एनजीओ और सामुदायिक आउटरीच संचालन',
  'Field Photos & Impact Video Media': 'फ़ील्ड फ़ोटो और प्रभाव वीडियो मीडिया',
  'Financial Transactions Log': 'वित्तीय लेन-देन लॉग',
  'Pledges & Campaign Tracker': 'प्रतिज्ञा और अभियान ट्रैकर',
  'Financial Overview & Ledgers': 'वित्तीय अवलोकन और बहीखाता',
  'Donations & Tithes Ledger': 'दान और दशमांश बहीखाता',
  'Bank Accounts & General Ledgers': 'बैंक खाते और सामान्य बहीखाता',
  'Sermon Archive & Video Publishing': 'उपदेश संग्रह और वीडियो प्रकाशन',
  'Content & CMS Hub': 'सामग्री और सीएमएस हब',
  'Media Library & Asset Manager': 'मीडिया लाइब्रेरी और एसेट मैनेजर',
  'Church Calendar & Events Manager': 'चर्च कैलेंडर और कार्यक्रम प्रबंधक',
  'Announcement Broadcasts': 'घोषणा प्रसारण',
  'Attendance Growth & Visitor Analytics': 'उपस्थिति वृद्धि और आगंतुक विश्लेषिकी',
  'Service Attendance Records': 'आराधना उपस्थिति रिकॉर्ड',
  'Attendance Hub': 'उपस्थिति हब',
  'Event & Special Service Attendance': 'कार्यक्रम और विशेष आराधना उपस्थिति',
  'Prayer Requests Dispatcher': 'प्रार्थना अनुरोध डिस्पैचर',
  'Family Unit Records': 'पारिवारिक इकाई रिकॉर्ड',
  'Donation Ledger Workspace': 'दान बहीखाता कार्यक्षेत्र',
  'Development Pledges': 'विकास प्रतिज्ञाएं',
  'Inflow / Outflow Transactions': 'आय / व्यय लेन-देन',
  'Church Fund Accounts': 'चर्च फंड खाते',
  'Church Attendance Records': 'चर्च उपस्थिति रिकॉर्ड',
  'Event Check-In Terminal': 'कार्यक्रम चेक-इन टर्मिनल',
  'Growth Analytics': 'वृद्धि विश्लेषिकी',
  'Preaching Sermons Library': 'उपदेश लाइब्रेरी',
  'Church Events Schedule': 'चर्च कार्यक्रम अनुसूची',
  'Media Gallery Library': 'मीडिया गैलरी लाइब्रेरी',
  'Sanctuary Page Editor': 'अभयारण्य पृष्ठ संपादक',
  'Role & Permission Security Matrices': 'भूमिका और अनुमति सुरक्षा मैट्रिक्स',
  'My Profile Details': 'मेरी प्रोफ़ाइल विवरण',
  'Public Page CMS': 'सार्वजनिक पृष्ठ सीएमएस'
};

const hiAdminDescriptions = {
  'Organize church members into ministries, life groups, cell groups, and volunteer departments.': 'चर्च के सदस्यों को मंत्रालयों, जीवन समूहों, सेल समूहों और स्वयंसेवक विभागों में व्यवस्थित करें।',
  'Manage believer records, roles, contact information, and membership statuses.': 'विश्वासियों के रिकॉर्ड, भूमिकाएं, संपर्क जानकारी और सदस्यता स्थिति प्रबंधित करें।',
  'Detailed membership records, registration dates, and role verification.': 'विस्तृत सदस्यता रिकॉर्ड, पंजीकरण तिथियां और भूमिका सत्यापन।',
  'Real-time operational summary across congregation, financial ledgers, and ministry activities.': 'मण्डली, वित्तीय बहीखाते और मंत्रालय गतिविधियों का वास्तविक समय परिचालन सारांश।',
  'Review church profiles, promote/demote user roles, and assign security credentials.': 'चर्च प्रोफाइल की समीक्षा करें, उपयोगकर्ता भूमिकाओं को बदलें और सुरक्षा क्रेडेंशियल्स सौंपें।',
  'Review, assign, pray for, and track testimonies submitted by believers.': 'विश्वासियों द्वारा प्रस्तुत गवाहियों की समीक्षा करें, प्रार्थना करें और ट्रैक करें।',
  'Map family trees, household heads, dependents, and anniversary tracking.': 'पारिवारिक वृक्ष, मुखिया, आश्रितों और वर्षगांठ को ट्रैक करें।',
  'Itemized income and expense vouchers, department debits, and auditing records.': 'मदवार आय और व्यय वाउचर, विभाग डेबिट और ऑडिटिंग रिकॉर्ड।',
  'Track building pledges, faith promises, mission campaign commitments, and fulfillment rates.': 'भवन प्रतिज्ञाओं, विश्वास वादों, मिशन अभियान प्रतिबद्धताओं और पूर्ति दरों को ट्रैक करें।',
  'Monitor tithes, offerings, online gateways (Razorpay/Stripe), building funds, and general accounts.': 'दशमांश, प्रसाद, ऑनलाइन गेटवे (रेज़रपे/स्ट्राइप), भवन निधि और सामान्य खातों की निगरानी करें।',
  'Live audit trail of online payment gateway transactions and offline cash contributions.': 'ऑनलाइन भुगतान गेटवे लेनदेन और ऑफ़लाइन नकद योगदान का लाइव ऑडिट विवरण।',
  'Manage ministry bank accounts, petty cash reserves, razorpay payout accounts, and fund balances.': 'मंत्रालय बैंक खाते, नकद भंडार, रेज़रपे भुगतान खाते और फंड शेष राशि प्रबंधित करें।',
  'Publish sermon videos, YouTube links, series topics, speaker names, and sermon notes.': 'उपदेश वीडियो, यूट्यूब लिंक, श्रृंखला विषय, वक्ता नाम और उपदेश नोट्स प्रकाशित करें।',
  'Edit hero section text, vision statement, service schedules, pastor biography, and contact info.': 'हीरो अनुभाग टेक्स्ट, दृष्टि विवरण, आराधना कार्यक्रम, पादरी जीवनी और संपर्क जानकारी संपादित करें।',
  'Manage public website content, sermons, event calendar, announcements, and media assets.': 'सार्वजनिक वेबसाइट सामग्री, उपदेश, कार्यक्रम कैलेंडर, घोषणाएं और मीडिया संपत्ति प्रबंधित करें।',
  'Cloudinary & Firebase media assets, service photos, event banners, and ministry graphics.': 'क्लाउडिनरी और फायरबेस मीडिया संपत्ति, सेवा तस्वीरें, कार्यक्रम बैनर और ग्राफिक्स।',
  'Schedule upcoming worship services, prayer vigils, conferences, youth rallies, and location details.': 'आगामी आराधना सेवाओं, प्रार्थना सभाओं, सम्मेलनों, युवा रैलियों और स्थान विवरण शेड्यूल करें।',
  'Post urgent alerts, weekly church news bulletins, and push notifications to congregation members.': 'तत्काल अलर्ट, साप्ताहिक चर्च समाचार बुलेटिन और मण्डली के सदस्यों को सूचनाएं पोस्ट करें।',
  'Quarterly retention curves, first-time visitor follow-up ratios, and trend reports.': 'त्रैमासिक प्रतिधारण वक्र, पहली बार आने वाले आगंतुकों के फॉलो-अप अनुपात और रुझान रिपोर्ट।',
  'Historical ledger of worship service attendances, split by main sanctuary, youth service, and kids church.': 'मुख्य अभयारण्य, युवा सेवा और बाल चर्च द्वारा विभाजित आराधना उपस्थिति का ऐतिहासिक बहीखाता।',
  'Track Sunday service headcounts, midweek prayer meetings, first-time visitors, and sanctuary growth.': 'रविवार सेवा की संख्या, मध्य-सप्ताह प्रार्थना सभाओं, पहली बार आने वाले आगंतुकों और विकास को ट्रैक करें।',
  'Special conference attendances, baptism ceremonies, retreats, and crusade check-ins.': 'विशेष सम्मेलन उपस्थिति, बपतिस्मा समारोह, रिट्रीट और क्रूसेड चेक-इन।',
  'Manage registered administrator, pastor, event manager, volunteer, and member accounts.': 'पंजीकृत प्रशासक, पादरी, कार्यक्रम प्रबंधक, स्वयंसेवक और सदस्य खातों को प्रबंधित करें।',
  'View security event logs, failed login attempts, API token invocations, and system integrity status.': 'सुरक्षा घटना लॉग, विफल लॉगिन प्रयास, एपीआई टोकन कॉल और सिस्टम अखंडता देखें।',
  'Assign SUPER_ADMIN, ADMIN, PASTOR, EVENT_MANAGER, FIELD_VOLUNTEER, and MEMBER roles.': 'SUPER_ADMIN, ADMIN, PASTOR, EVENT_MANAGER, FIELD_VOLUNTEER और MEMBER भूमिकाएं सौंपें।',
  'Fine-grained feature gates, API endpoint permissions, and RBAC (Role-Based Access Control) matrix.': 'सुव्यवस्थित सुविधा द्वार, एपीआई एंडपॉइंट अनुमतियां और आरबीएसी नियंत्रण मैट्रिक्स।',
  'System preferences, Church organization parameters, authentication policies, and security.': 'सिस्टम प्राथमिकताएं, चर्च संगठन पैरामीटर, प्रमाणीकरण नीतियां और सुरक्षा।',
  'Church name, address, contact phone, email server keys (Resend), SMS gateway (Twilio), and Razorpay IDs.': 'चर्च का नाम, पता, संपर्क फोन, ईमेल सर्वर कुंजी (Resend), एसएमएस गेटवे और रेज़रपे आईडी।',
  'Field volunteer assignments, emergency contact information, and service hours tracking.': 'फ़ील्ड स्वयंसेवक असाइनमेंट, आपातकालीन संपर्क जानकारी और सेवा घंटे ट्रैकिंग।',
  'Manage ongoing social initiatives, budget allocation, beneficiary statistics, and progress logs.': 'चल रही सामाजिक पहलों, बजट आवंटन, लाभार्थी आंकड़ों और प्रगति लॉग को प्रबंधित करें।',
  'Oversee charity initiatives, food distribution drives, medical camps, and community relief projects.': 'दान पहलों, भोजन वितरण अभियानों, चिकित्सा शिविरों और सामुदायिक राहत परियोजनाओं की देखरेख करें।',
  'Gallery of outreach event photographs, field reports, and beneficiary impact testimonies.': 'आउटरीच कार्यक्रम की तस्वीरों, फ़ील्ड रिपोर्टों और लाभार्थी प्रभाव गवाहियों की गैलरी।'
};

const enAdminTitles = {};
const enAdminDescriptions = {};
for (const key of Object.keys(teAdminTitles)) enAdminTitles[key] = key;
for (const key of Object.keys(teAdminDescriptions)) enAdminDescriptions[key] = key;

// Load existing en, te, hi from files directly
const enExisting = require('../i18n/locales/en.ts').en;
const teExisting = require('../i18n/locales/te.ts').te;
const hiExisting = require('../i18n/locales/hi.ts').hi;

// Enhance with nav.more, nav.allBranches, eventManager.queueReportBtn, branch names
function enrich(dict, lang) {
  const result = JSON.parse(JSON.stringify(dict));

  if (!result.nav) result.nav = {};
  if (!result.eventManager) result.eventManager = {};
  if (!result.branches) result.branches = {};

  if (lang === 'en') {
    result.nav.more = 'More';
    result.nav.allBranches = 'All Branches';
    result.eventManager.queueReportBtn = 'Queue Offline Report';
    result.branches.all = 'All Branches';
    result.branches.shapur = 'Shapur Nagar';
    result.branches.subhash = 'Subhash Nagar';
    result.branches.bahadur = 'Bahadurpally';
    result.branches.select = 'Select Branch';
    result.admin.pageTitles = enAdminTitles;
    result.admin.pageDescriptions = enAdminDescriptions;
  } else if (lang === 'te') {
    result.nav.more = 'మరిన్ని';
    result.nav.allBranches = 'అన్ని శాఖలు';
    result.eventManager.queueReportBtn = 'ఆఫ్‌లైన్ నివేదికను క్యూలో ఉంచండి';
    result.branches.all = 'అన్ని శాఖలు';
    result.branches.shapur = 'షాపూర్ నగర్';
    result.branches.subhash = 'సుభాష్ నగర్';
    result.branches.bahadur = 'బహదూర్‌పల్లి';
    result.branches.select = 'శాఖను ఎంచుకోండి';
    result.admin.pageTitles = teAdminTitles;
    result.admin.pageDescriptions = teAdminDescriptions;
  } else {
    result.nav.more = 'अधिक';
    result.nav.allBranches = 'सभी शाखाएँ';
    result.eventManager.queueReportBtn = 'ऑफ़लाइन रिपोर्ट कतार में जोड़ें';
    result.branches.all = 'सभी शाखाएँ';
    result.branches.shapur = 'शापूर नगर';
    result.branches.subhash = 'सुभाष नगर';
    result.branches.bahadur = 'बहादुरपल्ली';
    result.branches.select = 'शाखा चुनें';
    result.admin.pageTitles = hiAdminTitles;
    result.admin.pageDescriptions = hiAdminDescriptions;
  }

  return result;
}

const finalEn = enrich(enExisting, 'en');
const finalTe = enrich(teExisting, 'te');
const finalHi = enrich(hiExisting, 'hi');

const localesDir = path.join(__dirname, '../i18n/locales');

fs.writeFileSync(
  path.join(localesDir, 'en.ts'),
  'export const en: Record<string, any> = ' + JSON.stringify(finalEn, null, 2) + ';\n\nexport default en;\n'
);

fs.writeFileSync(
  path.join(localesDir, 'te.ts'),
  'export const te: Record<string, any> = ' + JSON.stringify(finalTe, null, 2) + ';\n\nexport default te;\n'
);

fs.writeFileSync(
  path.join(localesDir, 'hi.ts'),
  'export const hi: Record<string, any> = ' + JSON.stringify(finalHi, null, 2) + ';\n\nexport default hi;\n'
);

console.log('Successfully enriched and wrote en.ts, te.ts, hi.ts in frontend/i18n/locales');
