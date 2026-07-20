"use client";

import { User, Phone, Mail, FileText, HeartHandshake, EyeOff, ShieldCheck } from "lucide-react";

export interface FormFieldRule {
  id: string;
  fieldName: string;
  label: string;
  placeholder?: string | null;
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  fieldType: string; // text | email | tel | textarea | checkbox | select
}

interface DynamicDonorFormBuilderProps {
  fields: FormFieldRule[];
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
}

export default function DynamicDonorFormBuilder({
  fields,
  formData,
  onChange,
  errors = {},
}: DynamicDonorFormBuilderProps) {
  const visibleFields = fields.filter((f) => f.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);

  if (visibleFields.length === 0) return null;

  return (
    <div className="space-y-4 bg-gray-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          Donor Information & Preferences
        </h4>
        <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure SSL Encrypted
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleFields.map((field) => {
          const value = formData[field.fieldName] ?? "";
          const error = errors[field.fieldName];

          if (field.fieldType === "checkbox") {
            return (
              <div key={field.id} className="sm:col-span-2 pt-1">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(field.fieldName, e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded border-gray-300 dark:border-slate-700 focus:ring-violet-500"
                  />
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {field.label}
                  </span>
                </label>
              </div>
            );
          }

          if (field.fieldType === "textarea") {
            return (
              <div key={field.id} className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                  {field.label} {field.isRequired && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={2}
                  value={value}
                  onChange={(e) => onChange(field.fieldName, e.target.value)}
                  placeholder={field.placeholder || ""}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                    error ? "border-rose-500" : "border-gray-300 dark:border-slate-700"
                  } text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 transition`}
                />
                {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
              </div>
            );
          }

          const isFullWidth = field.fieldName === "panNumber" || field.fieldName === "address";

          return (
            <div key={field.id} className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                {field.label} {field.isRequired && <span className="text-rose-500">*</span>}
              </label>
              <input
                type={field.fieldType === "tel" ? "tel" : field.fieldType === "email" ? "email" : "text"}
                value={value}
                onChange={(e) => onChange(field.fieldName, e.target.value)}
                placeholder={field.placeholder || ""}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                  error ? "border-rose-500" : "border-gray-300 dark:border-slate-700"
                } text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 transition`}
              />
              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
