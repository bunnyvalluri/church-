"use client";

import React, { useState, useEffect } from "react";
import { Users, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
}

export default function NgoVolunteersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/ngo/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProjects(data.projects);
          }
        }
      } catch (err) {
        console.error("Failed to load projects for dropdown:", err);
      }
    }
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("IDLE");
    setErrorMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required fields.");
      setStatus("ERROR");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ngo/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          skills: skills || null,
          projectId: projectId || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("SUCCESS");
        // Clear form
        setName("");
        setEmail("");
        setPhone("");
        setSkills("");
        setProjectId("");
      } else {
        throw new Error(data.error || "Submission failed.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          
          {/* Left Pane: Info Card */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Get Involved
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Become a Volunteer
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Our community service initiatives depend on the dedication of volunteers. Whether you want to package meals, drive provisions to Ashramams, or assist patients in government hospitals, we have a place for you.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Register Details</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Let us know your skills and contact details.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Review & Placement</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Our Pastor/Admin team will align you with a project.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Start Serving</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Join the weekly outreaches and help distribute aid.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Interactive Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white text-left mb-6">Volunteer Application</h3>

            {status === "SUCCESS" && (
              <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">Registration Successful!</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Thank you for volunteering. The church pastoral team has received your application and will contact you shortly to coordinate scheduling.
                  </p>
                </div>
              </div>
            )}

            {status === "ERROR" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-left text-xs sm:text-sm text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* Row 1: Name & Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Project */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Preferred Initiative
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Any Initiative / General Service</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Skills / Details */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Skills, Experience or Message
                </label>
                <textarea
                  rows={4}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Tell us about yourself, your availability, or any specific skills you have..."
                  className="w-full py-3 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Volunteer Application</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
