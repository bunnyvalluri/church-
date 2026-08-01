/**
 * backend/src/services/sheetsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Sheets API v4 service for KCM Members Database.
 * Reads registered member rows and maps them to structured objects.
 *
 * Resilience Strategy (3-tier fallback):
 * 1. Tier 1: Official Google Sheets API v4 (using Service Account Key)
 * 2. Tier 2: Public Google Sheets CSV Exporter (no API key needed if sheet is shared)
 * 3. Tier 3: Database Fallback (Prisma `User` / `members` & `GoogleSheetsMember` tables)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const SHEET_ID        = process.env.GOOGLE_SHEETS_ID;
const SERVICE_EMAIL   = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_KEY_B64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const SHEET_RANGE     = process.env.GOOGLE_SHEETS_RANGE || 'KCM Members Database!A:M';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COL = {
  TIMESTAMP:          0,
  FULL_NAME:          1,
  MOBILE:             2,
  WHATSAPP:           3,
  EMAIL:              4,
  FAMILY_NAME:        5,
  FAMILY_MEMBERS:     6,
  BRANCH:             7,
  NOTIFICATION_PREFS: 8,
  MINISTRY_INTEREST:  9,
  PRAYER_REQUEST:     10,
  ADDRESS:            11,
  CONSENT:            12,
};

let _googleAuth = null;
let _sheets     = null;

/**
 * Lazily initialise official Google Sheets API client.
 */
async function _initSheets() {
  if (_sheets) return _sheets;
  if (!SHEET_ID || !SERVICE_KEY_B64) return null;

  try {
    const { google } = require('googleapis');
    const { GoogleAuth } = require('google-auth-library');

    const raw = Buffer.from(SERVICE_KEY_B64, 'base64').toString('utf8');
    const credentials = JSON.parse(raw);

    _googleAuth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    _sheets = google.sheets({ version: 'v4', auth: _googleAuth });
    console.log('[SHEETS] Official Google Sheets API v4 client initialised.');
    return _sheets;
  } catch (err) {
    console.warn('[SHEETS] Service Account auth failed:', err.message);
    return null;
  }
}

function _parsePreferences(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
}

function _normalisePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Tier 2: Fetch public Google CSV export without needing service account keys.
 */
function _fetchPublicCsv(sheetId) {
  return new Promise((resolve) => {
    if (!sheetId) return resolve(null);

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    const request = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return resolve(null);
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', () => resolve(null));
    };

    request(url);
  });
}

/**
 * Simple CSV parser for standard Google Sheets CSV exports.
 */
function _parseCsvRows(csvText) {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  return lines.map(line => {
    const row = [];
    let inQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

/**
 * Tier 3: Fetch members from PostgreSQL database (`User` table & `GoogleSheetsMember` table).
 */
async function _getMembersFromDb() {
  try {
    console.log('[SHEETS] Tier 3: Fetching members from PostgreSQL database...');
    
    // 1. Fetch from registered users table
    const users = await prisma.user.findMany({
      select: { name: true, email: true, phone: true, address: true },
    });

    // 2. Fetch from cached google sheets members table if available
    let sheetMembers = [];
    if (prisma.googleSheetsMember) {
      sheetMembers = await prisma.googleSheetsMember.findMany();
    }

    const membersMap = new Map();

    users.forEach(u => {
      if (u.email || u.phone) {
        const key = (u.email || u.phone).toLowerCase();
        membersMap.set(key, {
          fullName:          u.name || 'Church Member',
          mobile:            _normalisePhone(u.phone),
          whatsapp:          _normalisePhone(u.phone),
          email:             u.email ? u.email.toLowerCase() : null,
          familyName:        '',
          branch:            'All Branches',
          notificationPrefs: ['Email', 'SMS', 'WhatsApp', 'Push'],
          consentGiven:      true,
          source:            'DB_USER',
        });
      }
    });

    sheetMembers.forEach(sm => {
      const key = (sm.email || sm.mobile || sm.id).toLowerCase();
      if (!membersMap.has(key)) {
        membersMap.set(key, {
          fullName:          sm.fullName || 'Church Member',
          mobile:            _normalisePhone(sm.mobile),
          whatsapp:          _normalisePhone(sm.whatsapp),
          email:             sm.email ? sm.email.toLowerCase() : null,
          familyName:        sm.familyName || '',
          branch:            sm.branch || 'All Branches',
          notificationPrefs: sm.notificationPreferences || ['Email', 'SMS', 'WhatsApp', 'Push'],
          consentGiven:      sm.consentGiven !== false,
          source:            'DB_SHEETS_CACHE',
        });
      }
    });

    const membersList = Array.from(membersMap.values());
    console.log(`[SHEETS] Loaded ${membersList.length} members from DB fallback.`);
    return membersList;

  } catch (err) {
    console.error('[SHEETS] Database fallback error:', err.message);
    return [];
  }
}

/**
 * Fetch all eligible members using 3-tier fallback.
 *
 * @param {Object} [options]
 * @param {string} [options.branch]
 * @param {string} [options.channel]
 * @returns {Promise<Array>}
 */
async function getMembers({ branch = null, channel = null } = {}) {
  let rawRows = null;

  // Tier 1: Official API
  const sheets = await _initSheets();
  if (sheets && SHEET_ID) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range:         SHEET_RANGE,
      });
      rawRows = res.data.values || [];
      console.log(`[SHEETS] Tier 1 API success: ${rawRows.length} raw rows.`);
    } catch (err) {
      console.warn('[SHEETS] Tier 1 API failed:', err.message);
    }
  }

  // Tier 2: Public CSV
  if ((!rawRows || rawRows.length <= 1) && SHEET_ID) {
    console.log('[SHEETS] Attempting Tier 2 Public CSV fetch...');
    const csvData = await _fetchPublicCsv(SHEET_ID);
    if (csvData) {
      rawRows = _parseCsvRows(csvData);
      console.log(`[SHEETS] Tier 2 Public CSV success: ${rawRows.length} raw rows.`);
    }
  }

  let members = [];

  // Parse raw rows if fetched via Tier 1 or Tier 2
  if (rawRows && rawRows.length > 1) {
    members = rawRows
      .slice(1)
      .map((row, idx) => {
        const consent = String(row[COL.CONSENT] || '').toLowerCase();
        return {
          fullName:          (row[COL.FULL_NAME]    || '').trim(),
          mobile:            _normalisePhone(row[COL.MOBILE]),
          whatsapp:          _normalisePhone(row[COL.WHATSAPP]),
          email:             (row[COL.EMAIL]         || '').trim().toLowerCase() || null,
          familyName:        (row[COL.FAMILY_NAME]   || '').trim(),
          branch:            (row[COL.BRANCH]        || '').trim(),
          notificationPrefs: _parsePreferences(row[COL.NOTIFICATION_PREFS]),
          consentGiven:      consent.includes('yes') || consent.includes('agree') || consent === '',
          rowIndex:          idx + 2,
        };
      })
      .filter(m => m.consentGiven && (m.email || m.mobile || m.whatsapp));

    // Cache to DB asynchronously
    if (prisma.googleSheetsMember && members.length > 0) {
      setImmediate(async () => {
        try {
          for (const m of members) {
            if (m.email) {
              await prisma.googleSheetsMember.upsert({
                where: { id: `sheet_${m.email}` },
                update: { fullName: m.fullName, mobile: m.mobile, whatsapp: m.whatsapp, branch: m.branch, notificationPreferences: m.notificationPrefs },
                create: { id: `sheet_${m.email}`, sheetRowIndex: m.rowIndex, fullName: m.fullName, mobile: m.mobile, whatsapp: m.whatsapp, email: m.email, familyName: m.familyName, branch: m.branch, notificationPreferences: m.notificationPrefs, consentGiven: m.consentGiven },
              }).catch(() => {});
            }
          }
        } catch (e) {}
      });
    }
  }

  // Tier 3: Database Fallback if Tier 1 & Tier 2 returned 0 members
  if (members.length === 0) {
    members = await _getMembersFromDb();
  }

  // Apply branch filter
  const branchFiltered = branch
    ? members.filter(m => m.branch && m.branch.toLowerCase().includes(branch.toLowerCase()))
    : members;

  // Apply channel filter
  const channelMap = { EMAIL: 'Email', SMS: 'SMS', WHATSAPP: 'WhatsApp', PUSH: 'Push' };
  const finalMembers = channel
    ? branchFiltered.filter(m =>
        m.notificationPrefs.length === 0 ||
        m.notificationPrefs.some(p => p.toLowerCase() === (channelMap[channel] || channel).toLowerCase())
      )
    : branchFiltered;

  console.log(`[SHEETS] Final eligible member count: ${finalMembers.length}.`);
  return finalMembers;
}

/**
 * Connectivity test
 */
async function testConnection() {
  try {
    const members = await getMembers();
    return { ok: true, memberCount: members.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { getMembers, testConnection };
