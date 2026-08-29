/**
 * frontend/lib/email/email.renderer.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Master Responsive Email Layout Renderer for Kingdom of Christ Ministries
 * 
 * Bulletproof, cross-client HTML email framework compatible with:
 *   • Gmail (Android, iOS, Desktop Web)
 *   • Microsoft Outlook (Windows, macOS, Web)
 *   • Apple Mail (macOS, iOS, iPadOS)
 *   • Yahoo Mail, Samsung Email, Proton, Web browsers
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { emailConfig } from './email.config';

/**
 * Escapes user-controlled text to prevent HTML injection and XSS in emails.
 */
export function escapeHtml(input: any): string {
  if (input === null || input === undefined) {
    return '';
  }
  const str = String(input);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes headers/subjects to prevent CRLF email header injection attacks.
 */
export function sanitizeHeader(input: string): string {
  if (!input) return '';
  return String(input).replace(/[\r\n]+/g, ' ').trim();
}

export interface EmailRenderOptions {
  subject: string;
  previewText: string;
  badgeText?: string;
  badgeType?: 'default' | 'success' | 'warning' | 'info';
  greeting?: string;
  leadParagraph?: string;
  bodyHtml: string;
  dataBox?: {
    title?: string;
    rows: Array<{ label: string; value: string; isBold?: boolean; isMono?: boolean; color?: string }>;
  };
  ctaButton?: {
    label: string;
    url: string;
  };
  secondaryButton?: {
    label: string;
    url: string;
  };
  calloutBox?: {
    type?: 'note' | 'alert' | 'success';
    message: string;
  };
  closingText?: string;
  signoffLines?: string[];
  showUnsubscribe?: boolean;
  /**
   * Only rendered in development or staging test environments.
   * NEVER rendered in production.
   */
  environmentNotice?: {
    text: string;
    intendedRecipient?: string;
  };
}

export function renderMasterEmailHtml(options: EmailRenderOptions): string {
  const {
    subject,
    previewText,
    badgeText,
    badgeType = 'default',
    greeting,
    leadParagraph,
    bodyHtml,
    dataBox,
    ctaButton,
    secondaryButton,
    calloutBox,
    closingText,
    signoffLines = [
      'Warm regards in Christ,',
      '<strong>Kingdom of Christ Ministries</strong>',
      '<span style="color:#7c3aed;font-size:12px;font-weight:600;">Faith • Love • Service • Community</span>',
    ],
    showUnsubscribe = true,
    environmentNotice,
  } = options;

  const church = emailConfig.church;

  // ── Optional Environment Banner (Safe structured injection for Dev/Staging only) ──
  let envBannerHtml = '';
  if (environmentNotice && !emailConfig.environment.isProduction) {
    const safeNotice = escapeHtml(environmentNotice.text);
    const safeRecipient = environmentNotice.intendedRecipient
      ? ` Intended for <strong>${escapeHtml(environmentNotice.intendedRecipient)}</strong>.`
      : '';

    envBannerHtml = `
      <tr>
        <td style="background-color: #fef3c7; color: #92400e; padding: 12px 18px; text-align: center; font-size: 12px; font-weight: 600; border-bottom: 1px solid #fde68a; line-height: 1.5;">
          ⚠️ ${safeNotice}${safeRecipient}
        </td>
      </tr>`;
  }

  // ── Badge Styling ──────────────────────────────────────────────────────────
  let badgeHtml = '';
  if (badgeText) {
    let badgeBg = '#f3f4f6';
    let badgeColor = '#4b5563';
    let badgeBorder = '#e5e7eb';

    if (badgeType === 'success') {
      badgeBg = '#ecfdf5';
      badgeColor = '#059669';
      badgeBorder = '#a7f3d0';
    } else if (badgeType === 'warning') {
      badgeBg = '#fffbeb';
      badgeColor = '#b45309';
      badgeBorder = '#fde68a';
    } else if (badgeType === 'info') {
      badgeBg = '#eff6ff';
      badgeColor = '#2563eb';
      badgeBorder = '#bfdbfe';
    } else {
      badgeBg = '#f5f3ff';
      badgeColor = '#7c3aed';
      badgeBorder = '#ddd6fe';
    }

    badgeHtml = `
      <tr>
        <td align="center" style="padding: 0 0 16px;">
          <span style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
            ${escapeHtml(badgeText)}
          </span>
        </td>
      </tr>`;
  }

  // ── Callout Box ────────────────────────────────────────────────────────────
  let calloutHtml = '';
  if (calloutBox) {
    let calloutBg = '#f8fafc';
    let calloutBorder = '#7c3aed';
    let calloutColor = '#334155';

    if (calloutBox.type === 'alert') {
      calloutBg = '#fffbeb';
      calloutBorder = '#f59e0b';
      calloutColor = '#92400e';
    } else if (calloutBox.type === 'success') {
      calloutBg = '#f0fdf4';
      calloutBorder = '#10b981';
      calloutColor = '#065f46';
    }

    calloutHtml = `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${calloutBg}; border-left: 4px solid ${calloutBorder}; border-radius: 0 8px 8px 0; margin: 20px 0 24px;">
        <tr>
          <td style="padding: 14px 18px; font-size: 13px; line-height: 1.6; color: ${calloutColor};">
            ${calloutBox.message}
          </td>
        </tr>
      </table>`;
  }

  // ── Data Box (Table of details) ────────────────────────────────────────────
  let dataBoxHtml = '';
  if (dataBox && dataBox.rows && dataBox.rows.length > 0) {
    const rowsHtml = dataBox.rows
      .map(
        (r) => `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 500; width: 140px; vertical-align: top; border-bottom: 1px solid #f1f5f9;">
            ${r.label}:
          </td>
          <td style="padding: 8px 0; font-size: 13px; color: ${r.color || '#0f172a'}; font-weight: ${
          r.isBold ? '700' : '600'
        }; font-family: ${
          r.isMono ? "'SFMono-Regular', Consolas, Menlo, monospace" : 'inherit'
        }; text-align: right; word-break: break-word; border-bottom: 1px solid #f1f5f9;">
            ${r.value}
          </td>
        </tr>`
      )
      .join('');

    dataBoxHtml = `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf5ff; border: 1px solid #ede9fe; border-radius: 12px; margin: 20px 0 26px; overflow: hidden;">
        ${
          dataBox.title
            ? `<tr>
                <td style="padding: 12px 18px; background-color: #f3e8ff; border-bottom: 1px solid #e9d5ff; font-size: 11px; font-weight: 700; color: #6b21a8; text-transform: uppercase; letter-spacing: 0.08em;">
                  ${escapeHtml(dataBox.title)}
                </td>
              </tr>`
            : ''
        }
        <tr>
          <td style="padding: 14px 18px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              ${rowsHtml}
            </table>
          </td>
        </tr>
      </table>`;
  }

  // ── CTA Buttons ────────────────────────────────────────────────────────────
  let ctaHtml = '';
  if (ctaButton) {
    ctaHtml = `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0 28px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); background-color: #7c3aed; border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
                  <a href="${escapeHtml(ctaButton.url)}" target="_blank" class="btn-cta" style="display: inline-block; padding: 14px 34px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.03em; border-radius: 12px;">
                    ${escapeHtml(ctaButton.label)}
                  </a>
                </td>
                ${
                  secondaryButton
                    ? `<td style="width: 12px;"></td>
                       <td align="center" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px;">
                         <a href="${escapeHtml(secondaryButton.url)}" target="_blank" style="display: inline-block; padding: 13px 24px; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none; border-radius: 12px;">
                           ${escapeHtml(secondaryButton.label)}
                         </a>
                       </td>`
                    : ''
                }
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
  }

  // ── Sign-off ───────────────────────────────────────────────────────────────
  const signoffHtml = signoffLines.length
    ? `<div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
        ${signoffLines
          .map(
            (line) =>
              `<p style="margin: 0 0 4px; font-size: 13.5px; color: #475569; line-height: 1.5;">${line}</p>`
          )
          .join('')}
       </div>`
    : '';

  // ── Hidden Preheader with zero-width whitespace padding ────────────────────
  const safeSubject = escapeHtml(subject);
  const paddedPreheader = `${escapeHtml(previewText)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="format-detection" content="telephone=no"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${safeSubject} — ${escapeHtml(church.name)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .btn-cta { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b;">
  <!-- Hidden Preheader -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${paddedPreheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- ── Main Card Container ── -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          ${envBannerHtml}

          <!-- ── Top Purple Gradient Brand Header ── -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); background-color: #7c3aed; padding: 36px 30px 30px; text-align: center;">
              <!-- Cross Logo Badge -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px;">
                <tr>
                  <td align="center" style="width: 52px; height: 52px; background: rgba(255, 255, 255, 0.18); border: 2px solid rgba(255, 255, 255, 0.35); border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="font-size: 26px; line-height: 52px; color: #ffffff; font-weight: bold; display: block; font-family: serif;">✝</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase; text-shadow: 0 1px 2px rgba(0,0,0,0.15);">
                ${escapeHtml(church.name)}
              </h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.85); letter-spacing: 0.08em; text-transform: uppercase;">
                ${escapeHtml(church.tagline)}
              </p>
            </td>
          </tr>

          <!-- ── Main Content Area ── -->
          <tr>
            <td class="mobile-padding" style="padding: 36px 36px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                
                ${badgeHtml}

                ${
                  greeting
                    ? `<tr>
                        <td style="padding: 0 0 14px;">
                          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
                            ${escapeHtml(greeting)}
                          </h2>
                        </td>
                      </tr>`
                    : ''
                }

                ${
                  leadParagraph
                    ? `<tr>
                        <td style="padding: 0 0 18px; font-size: 15px; line-height: 1.65; color: #334155; font-weight: 500;">
                          ${escapeHtml(leadParagraph)}
                        </td>
                      </tr>`
                    : ''
                }

                <tr>
                  <td style="font-size: 14px; line-height: 1.7; color: #475569;">
                    ${bodyHtml}
                  </td>
                </tr>

                ${dataBoxHtml}

                ${calloutHtml}

                ${ctaHtml}

                ${
                  closingText
                    ? `<tr>
                        <td style="padding: 10px 0 14px; font-size: 14px; line-height: 1.6; color: #475569;">
                          ${escapeHtml(closingText)}
                        </td>
                      </tr>`
                    : ''
                }

                ${signoffHtml}

              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">
                ${escapeHtml(church.name)}
              </p>
              <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8;">
                ${escapeHtml(church.address)}
              </p>
              <p style="margin: 0 0 12px; font-size: 11px; color: #94a3b8;">
                ${escapeHtml(church.phone)} &bull; <a href="mailto:${escapeHtml(church.supportEmail)}" style="color: #7c3aed; text-decoration: none;">${escapeHtml(church.supportEmail)}</a>
              </p>
              
              <!-- Legal Links -->
              <p style="margin: 0 0 12px; font-size: 11px; color: #64748b;">
                <a href="${escapeHtml(church.websiteUrl)}" target="_blank" style="color: #7c3aed; text-decoration: none; font-weight: 600;">Website</a>
                &nbsp;&bull;&nbsp;
                <a href="${escapeHtml(church.privacyUrl)}" target="_blank" style="color: #7c3aed; text-decoration: none;">Privacy Policy</a>
                &nbsp;&bull;&nbsp;
                <a href="${escapeHtml(church.termsUrl)}" target="_blank" style="color: #7c3aed; text-decoration: none;">Terms of Service</a>
                ${
                  showUnsubscribe
                    ? `&nbsp;&bull;&nbsp;<a href="${escapeHtml(church.portalUrl)}" target="_blank" style="color: #94a3b8; text-decoration: none;">Notification Preferences</a>`
                    : ''
                }
              </p>

              <p style="margin: 0; font-size: 10.5px; color: #cbd5e1; line-height: 1.4;">
                This is an automated notification from ${escapeHtml(church.name)}. Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Strips HTML tags and converts structural elements into clean plain-text fallback.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&bull;/gi, '•')
    .replace(/&zwnj;/gi, '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
