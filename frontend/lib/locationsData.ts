/**
 * lib/locationsData.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Verified physical branch locations of Kingdom of Christ Ministries (KCM).
 * All addresses, service times, and contact points are authentic and truthful.
 */

export interface BranchService {
  day: string;
  time: string;
  type: string;
  dayTe?: string;
  typeTe?: string;
  dayHi?: string;
  typeHi?: string;
}

export interface BranchLocation {
  slug: string;
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  shortName: string;
  isMain: boolean;
  address: string;
  addressTe: string;
  addressHi: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
  geo: {
    latitude: number;
    longitude: number;
  };
  phones: string[];
  primaryPhone: string;
  email: string;
  mapUrl: string;
  embedMapQuery: string;
  heroImage: string;
  description: string;
  descriptionTe: string;
  descriptionHi: string;
  services: BranchService[];
  directions: string;
  directionsTe: string;
  directionsHi: string;
}

export const KCM_BRANCHES: Record<string, BranchLocation> = {
  "shapur-nagar": {
    slug: "shapur-nagar",
    id: "shapur",
    name: "Shapur Nagar Main Sanctuary",
    nameTe: "షాపూర్ నగర్ ప్రధాన మందిరం",
    nameHi: "शापुर नगर मुख्य धाम",
    shortName: "Shapur Nagar",
    isMain: true,
    address: "15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla",
    addressTe: "15-201, వివేకానంద నగర్, శ్రీనివాస్ నగర్, జీడిమెట్ల",
    addressHi: "15-201, विवेकानंद नगर, श्रीनिवास नगर, जीडीमेटला",
    locality: "Hyderabad",
    region: "Telangana",
    postalCode: "500055",
    country: "IN",
    geo: {
      latitude: 17.5186,
      longitude: 78.4487,
    },
    phones: ["+91-97040-90069", "+91-96409-43777"],
    primaryPhone: "+91 97040 90069",
    email: "kingofchristministries23@gmail.com",
    mapUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
    embedMapQuery: "Kingdom+of+Christ+Ministries+Jeedimetla+Hyderabad",
    heroImage: "https://images.unsplash.com/photo-1548625361-16eb16ad3f64?w=1200&q=80",
    description: "The primary worship sanctuary of Kingdom of Christ Ministries located in Jeedimetla, Hyderabad. Join us for vibrant Friday prayer fellowship and Sunday evening worship services led by Bishop Kurra Kristhu Raju.",
    descriptionTe: "జీడిమెట్లలోని కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్ ప్రధాన మందిరం. బిషప్ కుర్రా క్రీస్తు రాజు గారి నాయకత్వంలో శుక్రవారం ప్రార్థన మరియు ఆదివారం సాయంత్రం ఆరాధనలో పాల్గొనండి.",
    descriptionHi: "जीडीमेटला, हैदराबाद में किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज का मुख्य आराधना केंद्र। बिशप कुर्रा क्रिस्टु राजू के नेतृत्व में शुक्रवार प्रार्थना और रविवार शाम की आराधना में शामिल हों।",
    services: [
      {
        day: "Friday",
        dayTe: "శుక్రవారం",
        dayHi: "शुक्रवार",
        time: "6:00 PM – 8:30 PM",
        type: "Friday Prayer Fellowship",
        typeTe: "శుక్రవారం ప్రార్థన కూడిక",
        typeHi: "शुक्रवार प्रार्थना सभा",
      },
      {
        day: "Sunday",
        dayTe: "ఆదివారం",
        dayHi: "रविवार",
        time: "6:00 PM – 9:00 PM",
        type: "Sunday Evening Worship Service",
        typeTe: "ఆదివారం సాయంత్రం ఆరాధన సేవ",
        typeHi: "रविवार शाम की आराधना सेवा",
      },
    ],
    directions: "Located at 15-201 Vivekananda Nagar near Pipeline Road, easily accessible via Jeedimetla Main Road and Shapur Nagar Bus Stop.",
    directionsTe: "పైప్‌లైన్ రోడ్డు సమీపంలోని 15-201 వివేకానంద నగర్ వద్ద కలదు, జీడిమెట్ల మెయిన్ రోడ్ మరియు షాపూర్ నగర్ బస్ స్టాప్ ద్వారా సులభంగా చేరుకోవచ్చు.",
    directionsHi: "पाइपलाइन रोड के पास 15-201 विवेकानंद नगर में स्थित, जीडीमेटला मुख्य मार्ग और शापुर नगर बस स्टॉप से आसानी से पहुंचा जा सकता है।",
  },
  "subhash-nagar": {
    slug: "subhash-nagar",
    id: "subhash",
    name: "Subhash Nagar Branch",
    nameTe: "సుభాష్ నగర్ బ్రాంచ్",
    nameHi: "सुभाष नगर शाखा",
    shortName: "Subhash Nagar",
    isMain: false,
    address: "Subhash Nagar, Jeedimetla, LP 119",
    addressTe: "సుభాష్ నగర్, జీడిమెట్ల, LP 119",
    addressHi: "सुभाष नगर, जीडीमेटला, एलपी 119",
    locality: "Hyderabad",
    region: "Telangana",
    postalCode: "500055",
    country: "IN",
    geo: {
      latitude: 17.5142,
      longitude: 78.4419,
    },
    phones: ["+91-97040-90069", "+91-96409-43777"],
    primaryPhone: "+91 97040 90069",
    email: "kingofchristministries23@gmail.com",
    mapUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
    embedMapQuery: "Subhash+Nagar+Jeedimetla+Hyderabad",
    heroImage: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=1200&q=80",
    description: "Our vibrant Subhash Nagar sanctuary hosts early morning Sunday Watch Tower prayer, mid-morning worship, and Thursday Oil Anointing healing services.",
    descriptionTe: "మా సుభాష్ నగర్ మందిరంలో ప్రతి ఆదివారం ఉదయకాల వాచ్ టవర్ ప్రార్థన, రెండవ ఆరాధన మరియు గురువారం ఆయిల్ అభిషేక ప్రార్థన జరుగుతాయి.",
    descriptionHi: "हमारे सुभाष नगर धाम में प्रत्येक रविवार सुबह वॉच टॉवर प्रार्थना, दूसरी आराधना और गुरुवार को तेल अभिषेक प्रार्थना सेवा आयोजित की जाती है।",
    services: [
      {
        day: "Sunday",
        dayTe: "ఆదివారం",
        dayHi: "रविवार",
        time: "5:45 AM – 8:30 AM",
        type: "Sunday Morning Watch Tower Prayer",
        typeTe: "ఆదివారం ఉదయకాల ప్రార్థన (వాచ్ టవర్)",
        typeHi: "रविवार सुबह की प्रार्थना (वॉच टॉवर)",
      },
      {
        day: "Sunday",
        dayTe: "ఆదివారం",
        dayHi: "रविवार",
        time: "8:30 AM – 10:30 AM",
        type: "Sunday Second Worship Service",
        typeTe: "రెండవ ఆరాధన సేవ",
        typeHi: "दूसरी आराधना सेवा",
      },
      {
        day: "Thursday",
        dayTe: "గురువారం",
        dayHi: "गुरुवार",
        time: "6:30 PM – 8:30 PM",
        type: "Oil Anointing Prayer Service",
        typeTe: "ఆయిల్ అభిషేక ప్రార్థనా సేవ",
        typeHi: "तेल अभिषेक प्रार्थना सेवा",
      },
    ],
    directions: "Situated in Subhash Nagar near LP 119, Jeedimetla. Connects quickly from Quthbullapur and Chintal.",
    directionsTe: "జీడిమెట్లలోని LP 119 సమీపంలో సుభాష్ నగర్ వద్ద కలదు. కుత్బుల్లాపూర్ మరియు చింతల్ నుండి త్వరగా చేరుకోవచ్చు.",
    directionsHi: "जीडीमेटला में एलपी 119 के पास सुभाष नगर में स्थित। कुथबुल्लापुर और चिंताल से आसानी से जुड़ा हुआ है।",
  },
  "bahadurpally": {
    slug: "bahadurpally",
    id: "bahadur",
    name: "Bahadurpally Branch",
    nameTe: "బహదూర్‌పల్లి బ్రాంచ్",
    nameHi: "बहादुरपल्ली शाखा",
    shortName: "Bahadurpally",
    isMain: false,
    address: "Bahadurpally Main Road, Near Tech Mahindra / Gandimaisamma",
    addressTe: "బహదూర్‌పల్లి, హైదరాబాద్, తెలంగాణ",
    addressHi: "बहादुरपल्ली, हैदराबाद, तेलंगाना",
    locality: "Hyderabad",
    region: "Telangana",
    postalCode: "500043",
    country: "IN",
    geo: {
      latitude: 17.567689,
      longitude: 78.443963,
    },
    phones: ["+91-97040-90069", "+91-96409-43777"],
    primaryPhone: "+91 97040 90069",
    email: "kingofchristministries23@gmail.com",
    mapUrl: "https://maps.google.com/?q=17.567689,78.443963",
    embedMapQuery: "17.567689,78.443963",
    heroImage: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80",
    description: "Serving the North Hyderabad and Gandimaisamma community with Sunday afternoon worship fellowship and monthly 2nd Tuesday special intercession meetings.",
    descriptionTe: "ఉత్తర హైదరాబాద్ మరియు గాండిమైసమ్మ ప్రాంత ప్రజలకు సేవ చేస్తూ, ఆదివారం మధ్యాహ్న ఆరాధన మరియు ప్రతి నెలా 2వ మంగళవారం ప్రత్యేక ప్రార్థనలను అందిస్తుంది.",
    descriptionHi: "उत्तर हैदराबाद और गांधीमैसम्मा समुदाय के लिए रविवार दोपहर की आराधना और मासिक दूसरे मंगलवार की विशेष प्रार्थना सेवा।",
    services: [
      {
        day: "Sunday",
        dayTe: "ఆదివారం",
        dayHi: "रविवार",
        time: "11:00 AM – 1:00 PM",
        type: "Sunday Afternoon Worship Service",
        typeTe: "ఆదివారం మధ్యాహ్న ఆరాధన సేవ",
        typeHi: "रविवार दोपहर आराधना सेवा",
      },
      {
        day: "2nd Tuesday",
        dayTe: "2వ మంగళవారం",
        dayHi: "दूसरा मंगलवार",
        time: "11:00 AM – 1:30 PM",
        type: "Monthly Special Intercessory Prayer",
        typeTe: "నెలవారీ ప్రత్యేక ప్రార్థన",
        typeHi: "मासिक विशेष प्रार्थना",
      },
    ],
    directions: "Located in Bahadurpally on the Gandimaisamma-Medchal road, serving Bahadurpally, Suraram, and surrounding regions.",
    directionsTe: "గాండిమైసమ్మ-మేడ్చల్ రోడ్డులోని బహదూర్‌పల్లిలో కలదు. సురారం, బహదూర్‌పల్లి మరియు పరిసర ప్రాంతాల వారికి సులభం.",
    directionsHi: "गांधीमैसम्मा-मेडचल रोड पर बहादुरपल्ली में स्थित। सुरारम और आसपास के क्षेत्रों के लिए सुविधाजनक।",
  },
};

export const BRANCH_SLUGS = Object.keys(KCM_BRANCHES);
export const ALL_BRANCHES = Object.values(KCM_BRANCHES);
