/**
 * Formspark Form Submission Service
 * Directs all public ministry submissions directly to your email inbox via Formspark.io
 */

export const FORMSPARK_FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPARK_FORM_ID || "XIjY3PO0g";

export const FORMSPARK_URL = `https://submit-form.com/${FORMSPARK_FORM_ID}`;

export interface FormsparkPayload {
  formType: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  category?: string;
  areaOfInterest?: string;
  preferredBranch?: string;
  preferredDate?: string;
  groupName?: string;
  leaderName?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  initiative?: string;
  availability?: string;
  notes?: string;
  anonymous?: boolean;
  [key: string]: any;
}

export async function submitToFormspark(
  data: FormsparkPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const subjectPrefix = `[KCM - ${data.formType}]`;
    const emailSubject = data.subject
      ? data.subject.startsWith("[KCM")
        ? data.subject
        : `${subjectPrefix} ${data.subject}`
      : `${subjectPrefix} Submission from ${data.name || "Website Visitor"}`;

    const payload = {
      ...data,
      _email: {
        subject: emailSubject,
        from: "Kingdom of Christ Ministries Portal",
        replyTo: data.email || undefined,
      },
      _submittedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      _sourceUrl: typeof window !== "undefined" ? window.location.href : "KCM Web Portal",
    };

    const response = await fetch(FORMSPARK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.warn(`[FORMSPARK] Non-200 status (${response.status}):`, errText);
      // Even if Formspark has an edge case, return clean object
      return { success: response.status < 400, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[FORMSPARK_SUBMISSION_ERROR]", err);
    return { success: false, error: err?.message || "Failed to submit form to Formspark" };
  }
}
