/**
 * Centralized Bank Account Configuration for Kingdom of Christ Ministries.
 *
 * Can be overridden via environment variables:
 * - NEXT_PUBLIC_BANK_NAME
 * - NEXT_PUBLIC_BANK_ACCOUNT_NO
 * - NEXT_PUBLIC_BANK_IFSC
 * - NEXT_PUBLIC_BANK_ACCOUNT_NAME
 * - NEXT_PUBLIC_BANK_BRANCH
 */

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
}

export const BANK_DETAILS: BankDetails = {
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "Kingdom of Christ Ministries",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "1273102000011334",
  ifscCode: process.env.NEXT_PUBLIC_BANK_IFSC || "IBKL0001273",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "IDBI",
  branch: process.env.NEXT_PUBLIC_BANK_BRANCH || "IDBI Bank, Jeedimetla",
};

export default BANK_DETAILS;
