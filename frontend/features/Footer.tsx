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
    "rounded-md text-left font-medium text-foreground transition-colors hover:text-primary underline decoration-dotted underline-offset-2";

  const lightCard = "rounded-2xl border border-border bg-card shadow-sm backdrop-blur-md";

  const sectionHeading =
    "flex items-center gap-2 text-sm font-extrabold tracking-tight text-foreground";

  const mapChip =
    "inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground shadow-xs";

  return (
    <footer className="relative overflow-hidden border-t border-border bg-card dark:bg-zinc-950 text-foreground text-left transition-colors">
      {/* Official NCC Tricolor Hairline Stripe: Army Red → Navy Blue → Air Force / Sky Blue */}
      <div
        aria-hidden="true"
        className="relative z-20 h-1.5 w-full regimental-tricolor-gradient shadow-sm"
      />

      {/* Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-blue-500/5 blur-[100px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div aria-live="polite" className="sr-only">
          {copiedNotice}
        </div>

        {copiedNotice && (
          <div className="mb-8 flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 shadow-sm">
            <CheckCircle2
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>{copiedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Column 1 — Unit Identity & Mandate */}
          <div className="space-y-8 lg:col-span-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-border bg-muted p-3.5 shadow-sm">
                <ShieldCheck
                  className="size-6 text-blue-700 dark:text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#DC2626] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    Army Wing
                  </span>
                  <span className="rounded-md border border-blue-900/30 bg-[#1E3A8A] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    19 JHR BN NCC
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-black leading-tight tracking-tight text-foreground">
                  Sarala Birla University
                  <span className="block font-bold text-blue-700 dark:text-amber-400 text-sm">
                    Campus Company
                  </span>
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground font-medium">
              Official Senior Division &amp; Senior Wing Army Wing NCC Company established at Sarala
              Birla University (SBU), Ranchi. Training cadets for B &amp; C Certificate
              examinations, military firing and national Republic Day (RDC) trials. Under NCC Group
              HQ Ranchi • Bihar &amp; Jharkhand Directorate • Ministry of Defence.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className={`${lightCard} inline-flex items-center gap-2 px-4 py-2`}>
                <span
                  className="size-2 rounded-full bg-blue-600 dark:bg-amber-400"
                  aria-hidden="true"
                />
                <span className="numeric text-xs font-bold text-foreground">
                  160 SD/SW enrolled
                </span>
              </span>
              <span className={`${lightCard} inline-flex items-center gap-2 px-4 py-2`}>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-amber-400">
                  Unity &amp; Discipline
                </span>
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest font-black text-blue-700 dark:text-amber-400 font-mono">
                ANO / Officer Command
              </p>
              <p className="mt-1 font-black text-foreground">Lt. (Dr.) SBU Company</p>
            </div>
          </div>

          {/* Column 2 — Campus Office & Battalion HQ */}
          <div className="space-y-10 lg:col-span-4">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionHeading}>
                  <MapPin className="size-4 text-blue-700 dark:text-amber-400" aria-hidden="true" />
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

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  Birla Knowledge City, Vill. Ara, P.O. Mahilong, Ranchi–Purulia Highway (NH 320),
                  Ranchi 835103
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone
                    className="size-4 shrink-0 text-blue-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("7707004287", "SBU office phone")}
                    className={copyButtonClass}
                  >
                    +91 77070 04287 / +91 95251 10001
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail
                    className="size-4 shrink-0 text-blue-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("info@sburanchi.ac.in", "SBU info email")}
                    className={copyButtonClass}
                  >
                    info@sburanchi.ac.in
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Globe
                    className="size-4 shrink-0 text-blue-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  <a
                    href="https://sbu.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-700 dark:text-amber-400 transition-colors hover:text-foreground"
                  >
                    www.sbu.ac.in
                  </a>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionHeading}>
                  <Building2
                    className="size-4 text-blue-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
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

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  19 Jharkhand Battalion NCC, Sarhul Nagar, Lower Karamtoli, Ranchi, Jharkhand
                  834008
                </p>
                <p className="flex items-center gap-2 text-foreground">
                  <span className="text-blue-700 dark:text-amber-400 font-bold">Plus Code:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded border border-border font-bold">
                    98MR+M2F
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone
                    className="size-4 shrink-0 text-blue-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("06512260480", "Battalion phone")}
                    className={copyButtonClass}
                  >
                    0651-2260480 (CO office)
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail
                    className="size-4 shrink-0 text-blue-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
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
                  <span className="font-bold text-foreground">Mon–Sat, 09:00–17:00 IST</span>
                </p>
              </div>
            </section>
          </div>

          {/* Column 3 — Command Chain & Quick Contacts */}
          <div className="space-y-10 lg:col-span-4">
            <section className="space-y-4">
              <h3 className={sectionHeading}>
                <Globe className="size-4 text-blue-700 dark:text-amber-400" aria-hidden="true" />
                <span>Group HQ &amp; Directorate</span>
              </h3>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="font-bold text-foreground">NCC Group HQ Ranchi:</strong>{" "}
                  Kutchery Chowk / Morabadi Ground, Ranchi 834008
                </p>
                <p className="leading-relaxed">
                  <strong className="font-bold text-foreground">
                    NCC Directorate Bihar &amp; Jharkhand:
                  </strong>{" "}
                  CDA Building, Radhe Krishn Colony, Ghrounda, Patna, Bihar 800019
                  <span className="mt-0.5 block font-mono text-xs text-blue-700 dark:text-amber-400 font-bold">
                    Plus Code: J44V+JC Patna
                  </span>
                </p>
                <p className="leading-relaxed">
                  <strong className="font-bold text-foreground">HQ DG NCC:</strong> West Block-IV,
                  R.K. Puram, New Delhi 110066
                </p>

                <div className="space-y-2 pt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=NCC+Directorate+Bihar+%26+Jharkhand+CDA+Building+Patna+800019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between text-sm font-bold text-blue-700 dark:text-blue-400 transition-colors hover:text-foreground"
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
                    className="group/link flex items-center justify-between text-sm font-bold text-blue-700 dark:text-amber-400 transition-colors hover:text-foreground"
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
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-md">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-amber-400 font-mono">
                  HQ Helpline
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyContact("0651-2260480", "Battalion HQ helpline")}
                  id="footer-battalion-helpline-btn"
                  className="numeric mt-1 text-2xl font-black tracking-tight text-blue-700 dark:text-amber-400 transition-colors hover:text-primary cursor-pointer"
                >
                  0651-2260480
                </button>
              </div>

              <div className="h-px w-full bg-border" aria-hidden="true" />

              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Campus Email
                  </dt>
                  <dd className="truncate text-xs font-bold text-foreground">
                    info@sburanchi.ac.in
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Total Cadets
                  </dt>
                  <dd className="numeric text-xs font-bold text-foreground">160 SD/SW</dd>
                </div>
              </dl>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Sarala+Birla+University+Mahilong+Ranchi"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-sbu-map-directions-btn"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-600 dark:hover:bg-amber-700 px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <Navigation className="size-3.5" aria-hidden="true" />
                <span>SBU Campus Map</span>
              </a>
            </section>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row font-medium">
          <p className="order-2 text-center md:order-1 md:text-left">
            © {new Date().getFullYear()} 19 Jharkhand Battalion NCC • Sarala Birla University,
            Ranchi. All rights reserved.
          </p>

          <p className="order-1 inline-flex items-center gap-2 md:order-2">
            <span
              className="size-2 rounded-full bg-blue-600 dark:bg-amber-400"
              aria-hidden="true"
            />
            <span className="font-bold text-foreground">Unity &amp; Discipline</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-blue-700 dark:text-amber-400">
              Ekta aur Anushasan
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
