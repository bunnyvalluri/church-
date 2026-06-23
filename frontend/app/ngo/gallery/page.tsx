"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, Filter, Loader2, AlertCircle, Trash2, Calendar, Download, Share2, Info, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Encode a URL path so parentheses and spaces are safe for browsers
function encodeSrc(src: string): string {
  return src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

// ─── Real local KCM NGO images organised by category ─────────────────────────

const NIMS_HOSPITAL_IMAGES: string[] = [
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122751528_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122753030_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122804756_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122808039_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122811502_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122833065_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122837361_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122841656_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122845160_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122852335_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122855524_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122904849_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122916131_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_122945246_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123011133_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123013972_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123104306_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123129252_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123304110_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123402459_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG_20260311_123950653_HDR.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0037.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0043.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0045.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0047.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0049.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0052.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0055.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0057.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0059.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0060.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0062.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0070.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0073.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0076.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0079.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0081.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0083.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0085.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0087.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0089.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0091.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0093.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0095.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0097.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0111.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0112.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0117.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0120.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0125.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0160.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0163.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0165.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260311-WA0168.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260312-WA0033.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/11-03-2026(NIMS-HOSPITAL)/IMG-20260312-WA0034.jpg",
];

const GOVT_HOSPITAL_IMAGES: string[] = [
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0018.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0019.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0020.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0021.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0022.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0025.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0028.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0031.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0034.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0037.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0040.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0043.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0046.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0049.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0052.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0055.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0058.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0061.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0064.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0067.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0070.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0073.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260223-WA0074.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260224-WA0020.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/23-02-2026(GOVT-HOSPITAL)/IMG-20260224-WA0021.jpg",
];

const GANDHI_HOSPITAL_IMAGES: string[] = [
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0034.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0035.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0037.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0038.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0042.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0045.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0047.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0049.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0051.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0052.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0053.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0054.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0055.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0056.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0057.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0058.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0059.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0031.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0035.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0036.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0038.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0040.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0042.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0043.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0046.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0047.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0054.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260326-WA0029.jpg",
  "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260326-WA0031.jpg",
];

const ASHRAMAM_IMAGES: string[] = [
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0018.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0022.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0027.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0032.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0038.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0055.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0069.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0079.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0082.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0091.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0096.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0107.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0130.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0134.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0138.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0144.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0152.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0160.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0176.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0183.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0189.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0197.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0205.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0215.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0225.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0234.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0242.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260515-WA0252.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260516-WA0000.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/15-05-2026(AASHRAMAM)/IMG-20260516-WA0003.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0017.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0020.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0024.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0029.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0033.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0040.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0048.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0055.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0063.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0080.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0090.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0100.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0131.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0145.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0155.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0165.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0175.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0182.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0188.jpg",
  "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260422-WA0001.jpg",
];

const DISABLED_AASHRAMAM_IMAGES: string[] = [
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0015.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0017.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260615-WA0019.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0013.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0015.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0019.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0024.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0029.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0035.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0043.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0046.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0051.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0054.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0059.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0063.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0069.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0073.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0079.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0082.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0084.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0088.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0091.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0116.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0119.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0126.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0131.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0137.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0142.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0148.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0151.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0154.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0161.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0165.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0168.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0174.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0177.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0180.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0182.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0185.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0187.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0190.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0192.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0194.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0197.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260618-WA0005.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260618-WA0009.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260618-WA0010.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260618-WA0013.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_111041.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_111448.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_112609.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_113350.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_113831.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_113917.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_114033.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_114057.jpg",
  "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG_20260617_122418.jpg",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryItem {
  id: string;
  url: string;
  category: string;
  label: string;
  indexInCategory?: number;
}

function buildItems(paths: string[], category: string, label: string): GalleryItem[] {
  return paths.map((url, i) => ({
    id: `${category}-${i}`,
    url,
    category,
    label,
    indexInCategory: i,
  }));
}

// Helper to construct professional titles/descriptions for each image dynamically
function getImageDetails(item: GalleryItem, indexInCategory: number) {
  let title = `Outreach Event Photo #${indexInCategory + 1}`;
  let description = "KCM Social Service team in action, carrying out physical ministries to help the needy and underprivileged.";
  let date = "";

  // Extract date from url if present, e.g. "25-03-2026"
  const dateMatch = item.url.match(/(\d{2}-\d{2}-\d{4})/);
  if (dateMatch) {
    const rawDate = dateMatch[1];
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (!isNaN(d.getTime())) {
        date = d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }
    }
  }

  // If no date in folder, check for standard format like "20260615" (Home for disabled)
  if (!date) {
    const dateMatch2 = item.url.match(/(\d{4})(\d{2})(\d{2})/);
    if (dateMatch2) {
      const d = new Date(parseInt(dateMatch2[1]), parseInt(dateMatch2[2]) - 1, parseInt(dateMatch2[3]));
      if (!isNaN(d.getTime())) {
        date = d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }
    }
  }

  const dateSuffix = date ? ` · ${date}` : "";

  if (item.category === "GANDHI-HOSPITAL") {
    title = `Gandhi Hospital Food Outreach${dateSuffix}`;
    description = "KCM volunteers distributing nutritious food packets, water, and fresh bread to patients and caregivers in the emergency wards of Gandhi Hospital.";
  } else if (item.category === "NIMS-HOSPITAL") {
    title = `NIMS Hospital Care Campaign${dateSuffix}`;
    description = "Providing specialized patient kits containing required medicines, nutrition boxes, and hydration supplies to oncology and orthopedic departments at NIMS.";
  } else if (item.category === "GOVT-HOSPITAL") {
    title = `Govt Hospital Support Drive${dateSuffix}`;
    description = "Volunteers distributing essential hygiene items, fruits, physical walkers, and financial support guides for patients at the government general hospital.";
  } else if (item.category === "ASHRAMAM") {
    title = `Bethany Ashramam Provisions${dateSuffix}`;
    description = "Delivering monthly groceries, rice bags, school supplies, and healthy food items to children and residents of Bethany Samrakshana Ashramam.";
  } else if (item.category === "DISABLED-AASHRAMAM") {
    title = `Disabled Care Ashramam Visit${dateSuffix}`;
    description = "Providing comfort kits, warm blankets, bedsheets, and moral support to residents at the Home for the Disabled Ashramam.";
  }

  return { title, description, date };
}

const NIMS_ITEMS = buildItems(NIMS_HOSPITAL_IMAGES, "NIMS-HOSPITAL", "NIMS Hospital");
const GOVT_ITEMS = buildItems(GOVT_HOSPITAL_IMAGES, "GOVT-HOSPITAL", "Govt Hospital");
const GANDHI_ITEMS = buildItems(GANDHI_HOSPITAL_IMAGES, "GANDHI-HOSPITAL", "Gandhi Hospital");
const ASHRAMAM_ITEMS = buildItems(ASHRAMAM_IMAGES, "ASHRAMAM", "Bethany Ashramam");
const DISABLED_ITEMS = buildItems(DISABLED_AASHRAMAM_IMAGES, "DISABLED-AASHRAMAM", "Home for Disabled");

// Interleave elements from each category array so that the gallery starts with a beautiful variety
function interleaveGallery(
  ashramam: GalleryItem[],
  disabled: GalleryItem[],
  gandhi: GalleryItem[],
  nims: GalleryItem[],
  govt: GalleryItem[]
): GalleryItem[] {
  const result: GalleryItem[] = [];
  const maxLen = Math.max(ashramam.length, disabled.length, gandhi.length, nims.length, govt.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (i < ashramam.length) result.push(ashramam[i]);
    if (i < disabled.length) result.push(disabled[i]);
    if (i < gandhi.length) result.push(gandhi[i]);
    if (i < nims.length) result.push(nims[i]);
    if (i < govt.length) result.push(govt[i]);
  }
  return result;
}

const ALL_ITEMS: GalleryItem[] = interleaveGallery(
  ASHRAMAM_ITEMS,
  DISABLED_ITEMS,
  GANDHI_ITEMS,
  NIMS_ITEMS,
  GOVT_ITEMS
);

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All Photos", value: "ALL" },
  { label: "NIMS Hospital", value: "NIMS-HOSPITAL" },
  { label: "Govt Hospital", value: "GOVT-HOSPITAL" },
  { label: "Gandhi Hospital", value: "GANDHI-HOSPITAL" },
  { label: "Bethany Ashramam", value: "ASHRAMAM" },
  { label: "Home for Disabled", value: "DISABLED-AASHRAMAM" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "NIMS-HOSPITAL": "from-blue-600 to-cyan-500",
  "GOVT-HOSPITAL": "from-green-600 to-emerald-400",
  "GANDHI-HOSPITAL": "from-orange-500 to-amber-400",
  "ASHRAMAM": "from-purple-600 to-pink-400",
  "DISABLED-AASHRAMAM": "from-rose-500 to-red-400",
};

const PAGE_SIZE = 24;

export default function NgoGalleryPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  // Lightbox image state
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  
  // Fullscreen Lightbox enhancements
  const [zoomScale, setZoomScale] = useState(1);
  const [direction, setDirection] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lastTap, setLastTap] = useState(0);

  // Admin and deletion states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deletedUrls, setDeletedUrls] = useState<Set<string>>(new Set());
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const handleTitleClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminMode((curr) => {
          const nextVal = !curr;
          setToastMessage(nextVal ? "Admin Mode Enabled" : "Admin Mode Disabled");
          return nextVal;
        });
        return 0;
      }
      return next;
    });
  };

  // Reset click count after 3 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => { setMounted(true); }, []);

  // Load deleted URLs from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kcm_deleted_images");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setDeletedUrls(new Set(parsed));
          }
        } catch (e) {
          console.error("Failed to parse deleted images", e);
        }
      }
    }
  }, []);

  // Reset page when filter changes
  useEffect(() => { setDisplayLimit(PAGE_SIZE); }, [selectedCategory]);

  // Admin shortcut listener (Ctrl+Shift+D or Ctrl+Alt+D)
  useEffect(() => {
    const handleAdminKey = (e: KeyboardEvent) => {
      const isD = e.key === "D" || e.key === "d";
      const isCtrlShiftD = e.ctrlKey && e.shiftKey && isD;
      const isCtrlAltD = e.ctrlKey && e.altKey && isD;

      if (isCtrlShiftD || isCtrlAltD) {
        e.preventDefault();
        setIsAdminMode((prev) => {
          const nextVal = !prev;
          setToastMessage(nextVal ? "Admin Mode Enabled" : "Admin Mode Disabled");
          return nextVal;
        });
      }
    };
    window.addEventListener("keydown", handleAdminKey);
    return () => window.removeEventListener("keydown", handleAdminKey);
  }, []);

  // Toast automatic dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const activeItems = ALL_ITEMS.filter((item) => !deletedUrls.has(item.url) && !imgErrors.has(item.id));

  const filteredItems = selectedCategory === "ALL"
    ? activeItems
    : activeItems.filter((item) => item.category === selectedCategory);

  const displayedItems = filteredItems.slice(0, displayLimit);

  // Open lightbox — find the item's actual position in filteredItems
  const openLightbox = useCallback((filteredIdx: number) => {
    setLbLoading(true);
    setLbError(false);
    setLightboxIndex(filteredIdx);
    setShowMobileInfo(false);
    setZoomScale(1);
    setDirection(0);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLbLoading(false);
    setLbError(false);
    setShowMobileInfo(false);
    setZoomScale(1);
    document.body.style.overflow = "";
  }, []);

  const goTo = useCallback((idx: number, customDirection = 0) => {
    setLbLoading(true);
    setLbError(false);
    setDirection(customDirection);
    setLightboxIndex(idx);
    setShowMobileInfo(false);
    setZoomScale(1); // Reset zoom on image change
  }, []);

  const prevImage = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (lightboxIndex === null) return;
    const prevIdx = lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1;
    goTo(prevIdx, -1);
  }, [lightboxIndex, filteredItems.length, goTo]);

  const nextImage = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (lightboxIndex === null) return;
    const nextIdx = lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1;
    goTo(nextIdx, 1);
  }, [lightboxIndex, filteredItems.length, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prevImage(e);
      if (e.key === "ArrowRight") nextImage(e);
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prevImage, nextImage, closeLightbox]);

  // Hover controls auto-hide effect
  useEffect(() => {
    if (lightboxIndex === null) return;
    let timer: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Only hide if we aren't zoomed in
        if (zoomScale === 1) {
          setShowControls(false);
        }
      }, 3500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [lightboxIndex, zoomScale]);

  // Thumbnail auto-scrolling effect
  useEffect(() => {
    if (lightboxIndex !== null && thumbnailRefs.current[lightboxIndex]) {
      thumbnailRefs.current[lightboxIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [lightboxIndex]);

  // Clean up body scroll lock on unmount
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  const handleImgError = (id: string) => {
    setImgErrors((prev) => new Set(prev).add(id));
  };

  const handleDeleteImage = async (item: GalleryItem) => {
    setIsDeleting(true);
    try {
      // 1. Instantly hide on client side
      const updated = new Set(deletedUrls);
      updated.add(item.url);
      setDeletedUrls(updated);
      localStorage.setItem("kcm_deleted_images", JSON.stringify(Array.from(updated)));

      // If lightbox is open and we are deleting the current image, close it
      if (lightboxIndex !== null) {
        const currentItem = filteredItems[lightboxIndex];
        if (currentItem && currentItem.url === item.url) {
          closeLightbox();
        }
      }

      // 2. Call local deletion API
      const res = await fetch("/api/ngo/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: item.url }),
      });
      const data = await res.json();
      
      if (data.success) {
        setToastMessage("Image deleted successfully");
      } else {
        setToastMessage("Image hidden client-side (Read-only host)");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setToastMessage("Image hidden client-side");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ── Admin Mode Banner ── */}
        {isAdminMode && (
          <div className="fixed top-4 inset-x-4 z-[150] flex justify-center pointer-events-none">
            <div className="bg-slate-900/90 dark:bg-slate-955/90 text-white border border-red-500/30 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-mono tracking-wider font-semibold uppercase text-red-400">Admin Mode Active</span>
              <span className="text-xs text-slate-400 border-l border-white/10 pl-3">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-bold">Ctrl+Alt+D</kbd> or click title 5 times to exit</span>
            </div>
          </div>
        )}

        {/* ── Toast Notification ── */}
        {toastMessage && (
          <div className="fixed bottom-6 inset-x-6 z-[250] flex justify-center pointer-events-none">
            <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-semibold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* ── Custom Deletion Confirmation Modal ── */}
        {deletingItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 to-rose-500" />
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Photo?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Are you sure you want to delete this image?
                    <span className="block mt-2 font-mono text-xs text-slate-400 dark:text-slate-500 truncate">
                      {deletingItem.url.substring(deletingItem.url.lastIndexOf("/") + 1)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeletingItem(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteImage(deletingItem)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="space-y-3 max-w-2xl">
          <h1 
            onClick={handleTitleClick}
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent cursor-pointer select-none"
            title="Click 5 times to toggle Admin Mode"
          >
            {ngoT.galleryTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {ngoT.gallerySubtitle}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
            {filteredItems.length} photos
            {selectedCategory !== "ALL" && ` · ${CATEGORIES.find(c => c.value === selectedCategory)?.label}`}
          </p>
        </div>

        {/* ── Category Filters ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 uppercase font-mono tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            {ngoT.filterLabel}
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              id={`gallery-filter-${cat.value.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                selectedCategory === cat.value
                  ? "bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-300 border-purple-400/30 dark:border-purple-500/30 shadow-md shadow-purple-500/5"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Stats cards ───────────────────────────────────────────────────── */}
        {selectedCategory === "ALL" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.slice(1).map((cat) => {
              const count = activeItems.filter(i => i.category === cat.value).length;
              const gradient = CATEGORY_COLORS[cat.value] || "from-slate-600 to-slate-400";
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="group relative rounded-2xl overflow-hidden p-4 text-left border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-purple-400/40 dark:hover:border-purple-500/30 transition-all shadow-sm hover:shadow-lg hover:shadow-purple-500/5"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{count}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{cat.label}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Gallery Grid ──────────────────────────────────────────────────── */}
        {filteredItems.length === 0 ? (
          <div className="min-h-[30vh] flex items-center justify-center border border-slate-200 dark:border-white/5 rounded-3xl bg-slate-100/40 dark:bg-slate-900/40">
            <div className="text-center space-y-2 text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto" />
              <p className="text-sm">{ngoT.noPhotos}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* CSS Masonry using columns */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-5">
              {displayedItems.map((item, displayIdx) => {
                if (imgErrors.has(item.id)) return null;
                // Get the true index in filteredItems so lightbox is correct
                const filteredIdx = filteredItems.findIndex((fi) => fi.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => openLightbox(filteredIdx)}
                    className="break-inside-avoid mb-5 relative group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-900 cursor-pointer shadow-sm hover:border-purple-500/40 transition-all duration-500 hover:shadow-purple-500/10 hover:shadow-2xl animate-in fade-in duration-300"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openLightbox(filteredIdx)}
                    aria-label={`Open ${item.label} photo`}
                  >
                    {/* Category badge */}
                    <div className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[item.category] ?? "from-slate-600 to-slate-500"} shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      {item.label}
                    </div>

                    {/* Delete button (Admin Mode only) */}
                    {isAdminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingItem(item);
                        }}
                        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all duration-200 shadow-lg"
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Image using Next.js Image component */}
                    <div className="relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-950">
                      <Image
                        src={encodeSrc(item.url)}
                        alt={item.label}
                        width={600}
                        height={400}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFjMTkxZiIvPjwvc3ZnPg=="
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={() => handleImgError(item.id)}
                      />
                      
                      {/* Premium Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                        <div className="flex justify-end">
                          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500 delay-75">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                          <p className="text-white text-xs font-bold font-sans drop-shadow-sm uppercase tracking-wider">{item.label}</p>
                          <p className="text-white/70 text-[10px] font-medium drop-shadow-sm truncate mt-0.5">
                            {getImageDetails(item, item.indexInCategory ?? 0).title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {filteredItems.length > displayLimit && (
              <div className="flex justify-center pt-2">
                <button
                  id="gallery-load-more"
                  onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
                  className="px-8 py-3 font-semibold text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:border-purple-400/50 dark:hover:border-purple-500/30 transition-all shadow-md shadow-purple-500/5"
                >
                  Load more — {filteredItems.length - displayLimit} remaining
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Lightbox ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredItems.length > 0 && (() => {
            const currentItem = filteredItems[lightboxIndex];
            const gradient = CATEGORY_COLORS[currentItem?.category] ?? "from-slate-600 to-slate-500";
            const details = currentItem ? getImageDetails(currentItem, currentItem.indexInCategory ?? 0) : null;
            
            // Motion variants for slide/fade of image
            const slideVariants = {
              enter: (dir: number) => ({
                x: dir > 0 ? "100vw" : dir < 0 ? "-100vw" : 0,
                opacity: 0,
                scale: 0.95
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
                zIndex: 10
              },
              exit: (dir: number) => ({
                x: dir < 0 ? "100vw" : dir > 0 ? "-100vw" : 0,
                opacity: 0,
                scale: 0.95,
                zIndex: 0
              })
            };

            const handleImageTap = (e: React.MouseEvent | React.TouchEvent) => {
              e.stopPropagation();
              const now = Date.now();
              if (now - lastTap < 300) {
                // Double tap zoom toggle
                setZoomScale((prev) => (prev > 1 ? 1 : 2.5));
              } else {
                setLastTap(now);
              }
            };

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 w-screen h-screen z-[200] flex flex-col justify-between items-center bg-black/95 backdrop-blur-sm overflow-hidden select-none"
                onClick={closeLightbox}
                role="dialog"
                aria-modal="true"
                aria-label="Image lightbox"
              >
                
                {/* ── Prefetch adjacent images for instant transition ── */}
                {filteredItems[lightboxIndex + 1] && (
                  <img src={encodeSrc(filteredItems[lightboxIndex + 1].url)} className="hidden" alt="" />
                )}
                {filteredItems[lightboxIndex - 1] && (
                  <img src={encodeSrc(filteredItems[lightboxIndex - 1].url)} className="hidden" alt="" />
                )}

                {/* ── Top Floating Controls Bar ── */}
                <motion.div 
                  animate={{ y: showControls ? 0 : -80, opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} shadow-md`}>
                      {currentItem?.label}
                    </span>
                    <span className="text-white/70 text-xs font-mono font-bold drop-shadow-sm">
                      {lightboxIndex + 1} / {filteredItems.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                    {/* Zoom Toggle Button */}
                    <button
                      onClick={() => setZoomScale((prev) => (prev > 1 ? 1 : 2.5))}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95"
                      title={zoomScale > 1 ? "Zoom Out" : "Zoom In"}
                    >
                      {zoomScale > 1 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                    </button>

                    {/* Download Photo Button */}
                    <button
                      onClick={() => {
                        if (!currentItem) return;
                        const link = document.createElement("a");
                        link.href = encodeSrc(currentItem.url);
                        link.download = currentItem.url.substring(currentItem.url.lastIndexOf("/") + 1);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95"
                      title="Download Photo"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Share Link Button */}
                    <button
                      onClick={() => {
                        if (!currentItem) return;
                        const absoluteUrl = window.location.origin + currentItem.url;
                        navigator.clipboard.writeText(absoluteUrl);
                        setToastMessage("Image link copied to clipboard");
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95"
                      title="Share Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Information Toggle Button */}
                    <button
                      onClick={() => setShowMobileInfo((prev) => !prev)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all backdrop-blur-md border shadow-lg active:scale-95 ${
                        showMobileInfo 
                          ? "bg-purple-600 border-purple-500 text-white" 
                          : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                      }`}
                      title="Toggle Information"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {/* Admin Delete Button */}
                    {isAdminMode && currentItem && (
                      <button
                        onClick={() => setDeletingItem(currentItem)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white transition-all duration-200 shadow-lg active:scale-95"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={closeLightbox}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95"
                      title="Close Lightbox"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                {/* ── Left / Right Floating Navigation Buttons ── */}
                <AnimatePresence>
                  {showControls && zoomScale === 1 && (
                    <>
                      {/* Previous Image */}
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={prevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all shadow-xl backdrop-blur-md active:scale-90"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>

                      {/* Next Image */}
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={nextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all shadow-xl backdrop-blur-md active:scale-90"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>
                    </>
                  )}
                </AnimatePresence>

                {/* ── Main Viewport Area ── */}
                <div 
                  className="relative flex-1 w-full h-[calc(100vh-160px)] sm:h-[calc(100vh-200px)] flex items-center justify-center overflow-hidden"
                  onClick={closeLightbox}
                >
                  {/* Loading spinner */}
                  {lbLoading && !lbError && (
                    <div className="absolute z-20 flex flex-col items-center gap-3 bg-black/20 p-6 rounded-2xl backdrop-blur-sm">
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                      <span className="text-white/60 text-xs font-mono">Loading Photo...</span>
                    </div>
                  )}

                  {/* Error state */}
                  {lbError && (
                    <div className="absolute z-30 flex flex-col items-center gap-4 text-center max-w-xs p-6 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-lg">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Failed to load photo</p>
                        <p className="text-white/40 text-xs mt-1">Check your internet connection</p>
                      </div>
                      <button
                        onClick={() => { setLbLoading(true); setLbError(false); }}
                        className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors font-bold"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Sliding image container */}
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={lightboxIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.3 }
                      }}
                      drag={zoomScale === 1 ? true : true}
                      dragConstraints={zoomScale === 1 ? { left: 0, right: 0, top: 0, bottom: 0 } : { left: -400, right: 400, top: -400, bottom: 400 }}
                      dragElastic={zoomScale === 1 ? 0.6 : 0.05}
                      onDragEnd={(e, info) => {
                        if (zoomScale === 1) {
                          const swipeThresholdX = 100;
                          const swipeThresholdY = 120;
                          
                          if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
                            // Horizontal Swipe
                            if (info.offset.x > swipeThresholdX) {
                              prevImage();
                            } else if (info.offset.x < -swipeThresholdX) {
                              nextImage();
                            }
                          } else {
                            // Vertical Swipe down to close
                            if (info.offset.y > swipeThresholdY) {
                              closeLightbox();
                            }
                          }
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                      onClick={closeLightbox}
                    >
                      <div 
                        className="relative max-w-full max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <motion.div
                          animate={{ scale: zoomScale }}
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in"
                          onClick={handleImageTap}
                        >
                          <Image
                            src={encodeSrc(currentItem.url)}
                            alt={currentItem.label}
                            width={1620}
                            height={1080}
                            priority
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFjMTkxZiIvPjwvc3ZnPg=="
                            className={`max-w-[95vw] max-h-[70vh] sm:max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
                              lbError ? "opacity-0" : "opacity-100"
                            }`}
                            onLoad={() => setLbLoading(false)}
                            onError={() => { setLbLoading(false); setLbError(true); }}
                            style={{
                              pointerEvents: zoomScale > 1 ? "auto" : "none"
                            }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── Information Panel (Floating Sidebar on Right) ── */}
                <AnimatePresence>
                  {showMobileInfo && details && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="absolute top-20 right-4 bottom-24 w-80 sm:w-96 z-[60] p-6 bg-slate-900/90 backdrop-blur-lg border border-white/10 rounded-2xl text-left text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} shadow-sm`}>
                            {currentItem?.label}
                          </span>
                          <button
                            onClick={() => setShowMobileInfo(false)}
                            className="text-slate-400 hover:text-white transition-colors text-xs font-bold font-mono"
                          >
                            Hide details
                          </button>
                        </div>
                        <h2 className="text-base font-black text-white tracking-tight leading-snug">
                          {details.title}
                        </h2>
                        {details.date && (
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            <span>{details.date}</span>
                          </div>
                        )}
                        <div className="space-y-1.5 pt-2">
                          <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Outreach Description</h3>
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                            {details.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5 space-y-2 mt-6">
                        <button
                          onClick={() => {
                            if (!currentItem) return;
                            const link = document.createElement("a");
                            link.href = encodeSrc(currentItem.url);
                            link.download = currentItem.url.substring(currentItem.url.lastIndexOf("/") + 1);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Photo
                        </button>
                        <button
                          onClick={() => {
                            if (!currentItem) return;
                            const absoluteUrl = window.location.origin + currentItem.url;
                            navigator.clipboard.writeText(absoluteUrl);
                            setToastMessage("Image link copied to clipboard");
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Copy Image URL
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Bottom Thumbnail Strip ── */}
                <motion.div
                  animate={{ y: showControls ? 0 : 100, opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute bottom-4 inset-x-0 z-50 flex flex-col items-center gap-3 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-full max-w-4xl px-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 scrollbar-none select-none">
                    {filteredItems.map((item, idx) => (
                      <button
                        key={item.id}
                        ref={(el) => { thumbnailRefs.current[idx] = el; }}
                        onClick={() => goTo(idx, idx > lightboxIndex ? 1 : -1)}
                        className={`relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === lightboxIndex 
                            ? "border-purple-500 scale-110 opacity-100 shadow-lg shadow-purple-500/40" 
                            : "border-transparent opacity-40 hover:opacity-80"
                        }`}
                      >
                        <img
                          src={encodeSrc(item.url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>

              </motion.div>
            );
          })()}
        </AnimatePresence>

      </div>
    </div>
  );
}
