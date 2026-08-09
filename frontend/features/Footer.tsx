import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";

/**
 * Footer — Light Coffee Cream Theme with Official NCC Tricolor Hairline Stripe
 *
 * Palette & Tokens:
 * - Base Surface: Light Coffee Cream (#FAF7F2)
 * - Container Card: Pure White/Cream Glass (bg-white/80 border-[#8C5E3C]/20 shadow-sm)
 * - Headings & Primary Text: Deep Coffee Bronze (#3B281C)
 * - Subtext & Muted Text: Warm Dark Coffee (#6E5544)
 * - NCC Tricolor: Navy Blue (#1E3A8A), Army Red (#DC2626), Sky Blue (#0284C7)
 */
export const Footer: React.FC = () => {
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(`${label} copied to clipboard`);
    setTimeout(() => setCopiedNotice(null), 2000);
  };

  const copyButtonClass =
    "rounded-md text-left font-medium text-[#3B281C] transition-colors hover:text-[#1E3A8A] underline decoration-dotted underline-offset-2";

  const lightCard = "rounded-2xl border border-[#8C5E3C]/20 bg-white/90 shadow-sm backdrop-blur-md";

  const sectionHeading =
    "flex items-center gap-2 text-sm font-extrabold tracking-tight text-[#3B281C]";

  const mapChip =
    "inline-flex items-center gap-1 rounded-lg border border-[#8C5E3C]/30 bg-[#FAF4EC] px-2.5 py-1 text-[11px] font-bold text-[#8C5E3C] transition-all hover:bg-[#8C5E3C] hover:text-white shadow-xs";

  return (
    <footer className="relative overflow-hidden border-t border-[#8C5E3C]/20 bg-[#FAF7F2] text-[#3B281C] text-left">
      {/* Official NCC Tricolor Hairline Stripe: Army Red → Navy Blue → Air Force / Sky Blue */}
      <div
        aria-hidden="true"
        className="relative z-20 h-1 w-full bg-[linear-gradient(90deg,#DC2626_0%,#1E3A8A_50%,#0284C7_100%)] shadow-sm"
      />

      {/* Subtle Warm Background Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-[#8C5E3C]/5 blur-[100px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div aria-live="polite" className="sr-only">
          {copiedNotice}
        </div>

        {copiedNotice && (
          <div className="mb-8 flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-sm">
            <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
            <span>{copiedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Column 1 — Unit Identity & Mandate */}
          <div className="space-y-8 lg:col-span-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-[#8C5E3C]/30 bg-[#FAF4EC] p-3.5 text-[#8C5E3C] shadow-sm">
                <ShieldCheck className="size-6 text-[#1E3A8A]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#DC2626] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    Army Wing
                  </span>
                  <span className="rounded-md border border-[#1E3A8A]/30 bg-[#1E3A8A] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    19 JHR BN NCC
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-black leading-tight tracking-tight text-[#3B281C]">
                  Sarala Birla University
                  <span className="block font-bold text-[#8C5E3C] text-sm">Campus Company</span>
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#543E30] font-medium">
              Official Senior Division &amp; Senior Wing Army Wing NCC Company established at Sarala
              Birla University (SBU), Ranchi. Training cadets for B &amp; C Certificate
              examinations, military firing and national Republic Day (RDC) trials. Under NCC Group
              HQ Ranchi • Bihar &amp; Jharkhand Directorate • Ministry of Defence.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className={`${lightCard} inline-flex items-center gap-2 px-4 py-2`}>
                <span className="size-2 rounded-full bg-[#1E3A8A]" aria-hidden="true" />
                <span className="numeric text-xs font-bold text-[#3B281C]">160 SD/SW enrolled</span>
              </span>
              <span className={`${lightCard} inline-flex items-center gap-2 px-4 py-2`}>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E3C]">
                  Unity &amp; Discipline
                </span>
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest font-black text-[#8C5E3C]">
                ANO / Officer Command
              </p>
              <p className="mt-1 font-black text-[#3B281C]">Lt. (Dr.) SBU Company</p>
            </div>
          </div>

          {/* Column 2 — Campus Office & Battalion HQ */}
          <div className="space-y-10 lg:col-span-4">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionHeading}>
                  <MapPin className="size-4 text-[#8C5E3C]" aria-hidden="true" />
                  <span>SBU Campus Office</span>
                </h3>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sarala+Birla+University+Mahilong+Ranchi+Jharkhand+835103"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={mapChip}
                >
                  <span>Maps</span>
                  <ExternalLink className="size-2.5" aria-hidden="true" />
                </a>
              </div>

              <div className="space-y-2 text-sm text-[#543E30]">
                <p className="leading-relaxed">
                  Birla Knowledge City, Vill. Ara, P.O. Mahilong, Ranchi–Purulia Highway (NH 320),
                  Ranchi 835103
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-[#8C5E3C]" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("7707004287", "SBU office phone")}
                    className={copyButtonClass}
                  >
                    +91 77070 04287 / +91 95251 10001
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-[#8C5E3C]" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("info@sburanchi.ac.in", "SBU info email")}
                    className={copyButtonClass}
                  >
                    info@sburanchi.ac.in
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Globe className="size-4 shrink-0 text-[#8C5E3C]" aria-hidden="true" />
                  <a
                    href="https://sbu.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#1E3A8A] transition-colors hover:text-[#3B281C]"
                  >
                    www.sbu.ac.in
                  </a>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionHeading}>
                  <Building2 className="size-4 text-[#8C5E3C]" aria-hidden="true" />
                  <span>19 JHR Battalion HQ</span>
                </h3>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=19+Jharkhand+Battalion+NCC+Sarhul+Nagar+Ranchi+834008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={mapChip}
                >
                  <span>Maps</span>
                  <ExternalLink className="size-2.5" aria-hidden="true" />
                </a>
              </div>

              <div className="space-y-2 text-sm text-[#543E30]">
                <p className="leading-relaxed">
                  19 Jharkhand Battalion NCC, Sarhul Nagar, Lower Karamtoli, Ranchi, Jharkhand
                  834008
                </p>
                <p className="flex items-center gap-2 text-[#3B281C]">
                  <span className="text-[#8C5E3C] font-bold">Plus Code:</span>
                  <span className="font-mono text-xs bg-[#FAF4EC] px-2 py-0.5 rounded border border-[#8C5E3C]/20 font-bold">
                    98MR+M2F
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-[#8C5E3C]" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("06512260480", "Battalion phone")}
                    className={copyButtonClass}
                  >
                    0651-2260480 (CO office)
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-[#8C5E3C]" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("co.19jhrbn@ncc.gov.in", "Battalion email")}
                    className={copyButtonClass}
                  >
                    co.19jhrbn@ncc.gov.in
                  </button>
                </p>
                <p className="text-xs font-medium">
                  Working hours:{" "}
                  <span className="font-bold text-[#3B281C]">Mon–Sat, 09:00–17:00 IST</span>
                </p>
              </div>
            </section>
          </div>

          {/* Column 3 — Command Chain & Quick Contacts */}
          <div className="space-y-10 lg:col-span-4">
            <section className="space-y-4">
              <h3 className={sectionHeading}>
                <Globe className="size-4 text-[#8C5E3C]" aria-hidden="true" />
                <span>Group HQ &amp; Directorate</span>
              </h3>

              <div className="space-y-2 text-sm text-[#543E30]">
                <p className="leading-relaxed">
                  <strong className="font-bold text-[#3B281C]">NCC Group HQ Ranchi:</strong>{" "}
                  Kutchery Chowk / Morabadi Ground, Ranchi 834008
                </p>
                <p className="leading-relaxed">
                  <strong className="font-bold text-[#3B281C]">
                    NCC Directorate Bihar &amp; Jharkhand:
                  </strong>{" "}
                  CDA Building, Radhe Krishn Colony, Ghrounda, Patna, Bihar 800019
                  <span className="mt-0.5 block font-mono text-xs text-[#8C5E3C] font-bold">
                    Plus Code: J44V+JC Patna
                  </span>
                </p>
                <p className="leading-relaxed">
                  <strong className="font-bold text-[#3B281C]">HQ DG NCC:</strong> West Block-IV,
                  R.K. Puram, New Delhi 110066
                </p>

                <div className="space-y-2 pt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=NCC+Directorate+Bihar+%26+Jharkhand+CDA+Building+Patna+800019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between text-sm font-bold text-[#1E3A8A] transition-colors hover:text-[#3B281C]"
                  >
                    <span>Patna Directorate on Maps</span>
                    <ExternalLink
                      className="size-3 transition-transform group-hover/link:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                  <a
                    href="https://indiancc.nic.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between text-sm font-bold text-[#8C5E3C] transition-colors hover:text-[#1E3A8A]"
                  >
                    <span>Official India NCC portal</span>
                    <ExternalLink
                      className="size-3 transition-transform group-hover/link:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </section>

            {/* Quick Contacts — Primary Action Surface */}
            <section className="space-y-4 rounded-2xl border border-[#8C5E3C]/30 bg-white p-6 shadow-md">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#8C5E3C]">
                  HQ Helpline
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyContact("0651-2260480", "Battalion HQ helpline")}
                  id="footer-battalion-helpline-btn"
                  className="numeric mt-1 text-2xl font-black tracking-tight text-[#1E3A8A] transition-colors hover:text-[#DC2626]"
                >
                  0651-2260480
                </button>
              </div>

              <div className="h-px w-full bg-[#8C5E3C]/15" aria-hidden="true" />

              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[10px] uppercase font-bold tracking-wider text-[#8C5E3C]">
                    Campus Email
                  </dt>
                  <dd className="truncate text-xs font-bold text-[#3B281C]">
                    info@sburanchi.ac.in
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase font-bold tracking-wider text-[#8C5E3C]">
                    Total Cadets
                  </dt>
                  <dd className="numeric text-xs font-bold text-[#3B281C]">160 SD/SW</dd>
                </div>
              </dl>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Sarala+Birla+University+Mahilong+Ranchi"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-sbu-map-directions-btn"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#152A64] hover:shadow-lg active:scale-[0.98]"
              >
                <Navigation className="size-3.5" aria-hidden="true" />
                <span>SBU Campus Map</span>
              </a>
            </section>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#8C5E3C]/20 pt-8 text-xs text-[#543E30] md:flex-row font-medium">
          <p className="order-2 text-center md:order-1 md:text-left">
            © {new Date().getFullYear()} 19 Jharkhand Battalion NCC • Sarala Birla University,
            Ranchi. All rights reserved.
          </p>

          <p className="order-1 inline-flex items-center gap-2 md:order-2">
            <span className="size-2 rounded-full bg-[#1E3A8A]" aria-hidden="true" />
            <span className="font-bold text-[#3B281C]">Unity &amp; Discipline</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-[#8C5E3C]">Ekta aur Anushasan</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
