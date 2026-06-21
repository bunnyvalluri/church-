"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, Filter, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

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
}

function buildItems(paths: string[], category: string, label: string): GalleryItem[] {
  return paths.map((url, i) => ({
    id: `${category}-${i}`,
    url,
    category,
    label,
  }));
}

const ALL_ITEMS: GalleryItem[] = [
  ...buildItems(NIMS_HOSPITAL_IMAGES, "NIMS-HOSPITAL", "NIMS Hospital"),
  ...buildItems(GOVT_HOSPITAL_IMAGES, "GOVT-HOSPITAL", "Govt Hospital"),
  ...buildItems(GANDHI_HOSPITAL_IMAGES, "GANDHI-HOSPITAL", "Gandhi Hospital"),
  ...buildItems(ASHRAMAM_IMAGES, "ASHRAMAM", "Bethany Ashramam"),
  ...buildItems(DISABLED_AASHRAMAM_IMAGES, "DISABLED-AASHRAMAM", "Home for Disabled"),
];

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
    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLbLoading(false);
    setLbError(false);
    document.body.style.overflow = "";
  }, []);

  const goTo = useCallback((idx: number) => {
    setLbLoading(true);
    setLbError(false);
    setLightboxIndex(idx);
  }, []);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    goTo(lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1);
  }, [lightboxIndex, filteredItems.length, goTo]);

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    goTo(lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1);
  }, [lightboxIndex, filteredItems.length, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") goTo(lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1);
      if (e.key === "ArrowRight") goTo(lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1);
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, filteredItems.length, goTo, closeLightbox]);

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
                    className="break-inside-avoid mb-5 relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 cursor-pointer shadow hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/10 hover:shadow-xl animate-in fade-in zoom-in-95 duration-200"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openLightbox(filteredIdx)}
                    aria-label={`Open ${item.label} photo`}
                  >
                    {/* Category badge */}
                    <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-white text-[10px] font-bold bg-gradient-to-r ${CATEGORY_COLORS[item.category] ?? "from-slate-600 to-slate-500"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      {item.label}
                    </div>

                    {/* Delete button (Admin Mode only) */}
                    {isAdminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingItem(item);
                        }}
                        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-600/90 hover:bg-red-600 active:scale-95 text-white transition-all duration-200 shadow-md backdrop-blur-sm"
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <img
                      src={encodeSrc(item.url)}
                      alt={item.label}
                      loading="lazy"
                      onError={() => handleImgError(item.id)}
                      className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />

                    {/* Hover overlay with zoom icon */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <span className="text-white text-xs font-semibold drop-shadow">{item.label}</span>
                    </div>

                    {/* Tap indicator: subtle pulse ring on touch */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-500/0 group-active:ring-purple-500/60 transition-all duration-150" />
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
        {lightboxIndex !== null && filteredItems.length > 0 && (() => {
          const currentItem = filteredItems[lightboxIndex];
          const gradient = CATEGORY_COLORS[currentItem?.category] ?? "from-slate-600 to-slate-500";
          return (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
              onClick={closeLightbox}
              role="dialog"
              aria-modal="true"
              aria-label="Image lightbox"
            >
              {/* Backdrop blur layer */}
              <div className="absolute inset-0 backdrop-blur-sm" />

              {/* ── Top bar ── */}
              <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
                {/* Counter + label */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${gradient}`}>
                    {currentItem?.label}
                  </span>
                  <span className="text-white/50 text-xs font-mono tabular-nums">
                    {lightboxIndex + 1} / {filteredItems.length}
                  </span>
                </div>

                {/* Close & Delete buttons */}
                <div className="flex items-center gap-2">
                  {isAdminMode && currentItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingItem(currentItem);
                      }}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600/80 border border-red-500/30 hover:bg-red-600 active:scale-95 text-white transition-all duration-200 shadow-md"
                      title="Delete Image"
                      aria-label="Delete Image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                    id="lightbox-close"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 active:bg-white/30 text-white transition-all duration-200"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ── Navigation: Prev ── */}
              <button
                onClick={prevImage}
                id="lightbox-prev"
                className="absolute left-2 sm:left-5 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* ── Navigation: Next ── */}
              <button
                onClick={nextImage}
                id="lightbox-next"
                className="absolute right-2 sm:right-5 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* ── Main image area ── */}
              <div
                className="relative z-10 flex items-center justify-center w-full h-full p-4 sm:p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Loading spinner */}
                {lbLoading && !lbError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                      <span className="text-white/60 text-xs font-mono">Loading photo…</span>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {lbError && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Failed to load image</p>
                      <p className="text-white/40 text-xs mt-1">Please check your connection</p>
                    </div>
                    <button
                      onClick={() => { setLbLoading(true); setLbError(false); }}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* The image itself */}
                {currentItem && (
                  <img
                    key={currentItem.id}
                    src={encodeSrc(currentItem.url)}
                    alt={currentItem.label}
                    loading="eager"
                    onLoad={() => setLbLoading(false)}
                    onError={() => { setLbLoading(false); setLbError(true); }}
                    className={`w-auto h-auto object-contain rounded-2xl shadow-2xl ring-1 ring-white/10 transition-opacity duration-300 ${lbError ? "opacity-0 absolute" : "opacity-100"}`}
                    style={{ maxHeight: "85vh", maxWidth: "90vw" }}
                  />
                )}
              </div>

              {/* ── Thumbnail dot nav (bottom) ── */}
              <div className="absolute bottom-0 inset-x-0 z-10 flex justify-center py-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-1.5">
                  {filteredItems.length <= 20 ? (
                    filteredItems.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); goTo(i); }}
                        className={`rounded-full transition-all duration-200 ${
                          i === lightboxIndex
                            ? "w-6 h-2 bg-white"
                            : "w-2 h-2 bg-white/30 hover:bg-white/60"
                        }`}
                        aria-label={`Go to photo ${i + 1}`}
                      />
                    ))
                  ) : (
                    <span className="text-white/40 text-xs font-mono">
                      {currentItem?.label} · KCM NGO Services
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
