/**
 * scripts/google/NotificationWebhook.gs
 * ─────────────────────────────────────────────────────────────────────────────
 * KCM Ministries — Google Apps Script Event Notification Webhook
 *
 * DEPLOYMENT:
 * 1. Open https://script.google.com → New Project
 * 2. Paste this entire script
 * 3. Set Script Properties (Project Settings → Script Properties):
 *    - KCM_WEBHOOK_SECRET : <your_secret>
 *    - SHEET_ID           : <your_google_sheet_id>
 *    - BACKEND_URL        : https://your-backend.kcmministries.org
 * 4. Deploy → New Deployment → Web App
 *    Execute as: Me | Access: Anyone
 * 5. Copy the Web App URL → add to backend .env as GOOGLE_SCRIPT_WEBHOOK_URL
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Script Properties ─────────────────────────────────────────────────────────
var SCRIPT_PROPS  = PropertiesService.getScriptProperties();
var WEBHOOK_SECRET = SCRIPT_PROPS.getProperty('KCM_WEBHOOK_SECRET') || 'kcm_google_webhook_secret';
var SHEET_ID      = SCRIPT_PROPS.getProperty('SHEET_ID');
var BACKEND_URL   = SCRIPT_PROPS.getProperty('BACKEND_URL') || 'https://api.kcmministries.org';
var CHURCH_NAME   = 'Kingdom of Christ Ministries';
var EVENTS_URL    = 'https://kcmchurch.vercel.app/#events';

// Column mapping (0-based) — must match KCM Members Database sheet
var COL_FULL_NAME   = 1;
var COL_MOBILE      = 2;
var COL_WHATSAPP    = 3;
var COL_EMAIL       = 4;
var COL_BRANCH      = 7;
var COL_NOTIF_PREF  = 8;
var COL_CONSENT     = 12;

// ── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * HTTP POST handler — triggered by the KCM backend after a new event is saved.
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // 1. Authenticate webhook secret
    var incomingSecret = body.secret || e.parameter.secret || '';
    if (incomingSecret !== WEBHOOK_SECRET) {
      Logger.log('UNAUTHORIZED: Invalid webhook secret from ' + (e.parameter.remoteAddress || 'unknown'));
      return _jsonResponse({ error: 'Unauthorized', code: 401 });
    }

    var eventData = {
      event_title:       body.event_title       || 'New Event',
      event_branch:      body.event_branch      || 'All Branches',
      event_date:        body.event_date        || 'TBA',
      event_description: body.event_description || '',
      event_link:        body.event_link        || EVENTS_URL,
    };

    Logger.log('Webhook received for event: ' + eventData.event_title);

    // 2. Load members from Google Sheet
    var members = _loadMembers();
    Logger.log('Loaded ' + members.length + ' eligible members.');

    // 3. Send Gmail emails to members who opted for Email notifications
    var emailResults = _sendBulkEmails(members, eventData);

    // 4. Log summary
    Logger.log('Email dispatch complete: ' + JSON.stringify(emailResults));

    return _jsonResponse({
      success: true,
      members_loaded: members.length,
      emails_sent: emailResults.sent,
      emails_failed: emailResults.failed,
    });

  } catch (err) {
    Logger.log('ERROR in doPost: ' + err.message);
    return _jsonResponse({ error: err.message, success: false });
  }
}

/**
 * HTTP GET handler — health check endpoint.
 */
function doGet(e) {
  return _jsonResponse({
    status: 'OK',
    service: 'KCM Ministries Notification Webhook',
    timestamp: new Date().toISOString(),
  });
}

// ── Member Loader ────────────────────────────────────────────────────────────

/**
 * Load all eligible members from the KCM Members Database Google Sheet.
 * Filters by: consent given + has email address.
 */
function _loadMembers() {
  if (!SHEET_ID) {
    Logger.log('WARNING: SHEET_ID not set in Script Properties.');
    return [];
  }

  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName('KCM Members Database') || spreadsheet.getActiveSheet();
    var rows = sheet.getDataRange().getValues();

    if (rows.length <= 1) return []; // Header only

    var members = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var consent = String(row[COL_CONSENT] || '').toLowerCase();
      var hasConsent = consent.indexOf('yes') >= 0 || consent.indexOf('agree') >= 0;
      var email = String(row[COL_EMAIL] || '').trim().toLowerCase();

      if (!hasConsent || !email) continue;

      var notifPref = String(row[COL_NOTIF_PREF] || '');
      members.push({
        fullName:   String(row[COL_FULL_NAME]  || '').trim(),
        mobile:     String(row[COL_MOBILE]     || '').trim(),
        whatsapp:   String(row[COL_WHATSAPP]   || '').trim(),
        email:      email,
        branch:     String(row[COL_BRANCH]     || '').trim(),
        notifPref:  notifPref,
        rowIndex:   i + 1,
      });
    }

    return members;

  } catch (err) {
    Logger.log('ERROR loading sheet: ' + err.message);
    return [];
  }
}

// ── Email Sender ─────────────────────────────────────────────────────────────

/**
 * Send Gmail notifications to all eligible members.
 * Respects notification preferences — only sends to members who opted for Email.
 */
function _sendBulkEmails(members, eventData) {
  var sent = 0, failed = 0, skipped = 0;
  var subject = 'New Church Event - ' + CHURCH_NAME;

  for (var i = 0; i < members.length; i++) {
    var member = members[i];

    // Check email notification preference
    var notifPref = member.notifPref.toLowerCase();
    var wantsEmail = notifPref === '' ||
                     notifPref.indexOf('email') >= 0 ||
                     notifPref.indexOf('all')   >= 0;

    if (!wantsEmail) {
      skipped++;
      continue;
    }

    try {
      var plainBody = _buildPlainEmailBody(member, eventData);
      var htmlBody  = _buildHtmlEmailBody(member, eventData);

      GmailApp.sendEmail(member.email, subject, plainBody, {
        htmlBody: htmlBody,
        name:     CHURCH_NAME,
      });

      sent++;
      Logger.log('Email sent to: ' + member.email);

      // Small delay to avoid Gmail quota issues (100 emails/day for free accounts)
      Utilities.sleep(200);

    } catch (err) {
      failed++;
      Logger.log('ERROR sending to ' + member.email + ': ' + err.message);
    }
  }

  Logger.log('Email summary — Sent: ' + sent + ', Failed: ' + failed + ', Skipped: ' + skipped);
  return { sent: sent, failed: failed, skipped: skipped };
}

// ── Email Templates ──────────────────────────────────────────────────────────

function _buildPlainEmailBody(member, eventData) {
  var dateStr = _formatDate(eventData.event_date);
  return [
    'Dear ' + (member.fullName || 'Beloved Member') + ',',
    '',
    'Praise God! A new event has been added at ' + CHURCH_NAME + '.',
    '',
    'Event: ' + eventData.event_title,
    'Branch: ' + eventData.event_branch,
    'Date: ' + dateStr,
    '',
    'View full details: ' + eventData.event_link,
    '',
    'God bless you and your family.',
    '',
    '— KCM Ministries Team',
  ].join('\n');
}

function _buildHtmlEmailBody(member, eventData) {
  var dateStr  = _formatDate(eventData.event_date);
  var name     = member.fullName || 'Beloved Member';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>' +
    '<body style="margin:0;padding:0;background:#0f0f1a;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td align="center" style="padding:40px 20px;">' +
    '<table width="580" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;">' +

    // Header
    '<tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);padding:36px;text-align:center;">' +
    '<div style="font-size:32px;">✝️</div>' +
    '<h1 style="color:#fff;margin:8px 0 0;font-size:22px;">' + CHURCH_NAME + '</h1>' +
    '<p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">A place of Love, Faith &amp; Miracles</p>' +
    '</td></tr>' +

    // Body
    '<tr><td style="padding:36px;">' +
    '<p style="color:#c4b5fd;font-size:16px;margin:0 0 16px;">Dear <strong style="color:#fff;">' + name + '</strong>,</p>' +
    '<p style="color:#a78bfa;font-size:14px;line-height:1.7;margin:0 0 24px;">Praise God! A new event has been announced at ' + CHURCH_NAME + '.</p>' +

    // Event Card
    '<div style="background:#0f0f1a;border-radius:10px;border:1px solid #7c3aed;padding:24px;margin-bottom:24px;">' +
    '<div style="color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📅 New Event</div>' +
    '<h2 style="color:#fff;margin:0 0 14px;font-size:20px;">' + eventData.event_title + '</h2>' +
    '<p style="color:#94a3b8;font-size:13px;margin:4px 0;">📍 Branch: <span style="color:#e2e8f0;font-weight:500;">' + eventData.event_branch + '</span></p>' +
    '<p style="color:#94a3b8;font-size:13px;margin:4px 0;">📆 Date: <span style="color:#e2e8f0;font-weight:500;">' + dateStr + '</span></p>' +
    (eventData.event_description ? '<p style="color:#64748b;font-size:13px;margin:12px 0 0;line-height:1.6;border-top:1px solid #2d2d44;padding-top:12px;">' + eventData.event_description.substring(0, 200) + '...</p>' : '') +
    '</div>' +

    // CTA
    '<div style="text-align:center;margin-bottom:28px;">' +
    '<a href="' + eventData.event_link + '" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:14px;font-weight:600;">View Event →</a>' +
    '</div>' +
    '<p style="color:#64748b;font-size:13px;margin:0;">God bless you and your family. We look forward to worshipping together.</p>' +
    '<p style="color:#64748b;font-size:13px;margin:10px 0 0;">In His Love,<br/><strong style="color:#94a3b8;">KCM Ministries Team</strong></p>' +
    '</td></tr>' +

    // Footer
    '<tr><td style="background:#0f0f1a;padding:20px;text-align:center;border-top:1px solid #1e1e38;">' +
    '<p style="color:#475569;font-size:11px;margin:0;">' + CHURCH_NAME + ' · Hyderabad, Telangana<br/>' +
    '<a href="' + EVENTS_URL + '" style="color:#7c3aed;text-decoration:none;">kcmministries.org</a></p>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';
}

// ── Utility Functions ────────────────────────────────────────────────────────

function _formatDate(dateStr) {
  if (!dateStr || dateStr === 'TBA') return 'TBA';
  try {
    var d = new Date(dateStr);
    var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } catch(e) {
    return String(dateStr);
  }
}

function _jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
