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
 * Footer — inverted band, enterprise SaaS 12-column grid.
 *
 * Design notes:
 * - Three balanced columns: unit identity, locations, command chain + quick contacts.
 *   Replaces the previous 4 dense boxed columns so scanning order matches intent.
 * - Glass treatment (`bg-inverse-elevated/60 backdrop-blur-xl`) on stat and contact
 *   cards: only the standard `backdrop-filter` via Tailwind utilities.
 * - Tokens only (`surface-inverse`, `inverse-*`, `primary-on-inverse`) so the band
 *   survives a theme switch; weights capped at semibold for real hierarchy.
 * - All addresses, numbers, links and clipboard handlers are preserved verbatim.
 */
export const Footer: React.FC = () => {
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(`${label} copied to clipboard`);
    setTimeout(() => setCopiedNotice(null), 2000);
  };

  const copyButtonClass =
    "rounded-md text-left font-medium text-inverse-foreground/90 transition-colors hover:text-primary-on-inverse";

  const glassCard =
    "rounded-2xl border border-inverse-border bg-inverse-elevated/60 backdrop-blur-xl";

  const sectionHeading =
    "flex items-center gap-2 text-sm font-semibold tracking-tight text-inverse-foreground";

  const mapChip =
    "inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary-on-inverse transition-colors hover:bg-primary/20";

  return (
    <footer className="surface-inverse relative overflow-hidden border-t border-inverse-border text-left">
      {/* Institutional tricolour keyline: Army red → Navy → Air Force blue. */}
      <div
        aria-hidden="true"
        className="relative z-20 h-0.5 w-full bg-[linear-gradient(90deg,var(--color-destructive),var(--color-primary),var(--color-info))]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div aria-live="polite" className="sr-only">
          {copiedNotice}
        </div>

        {copiedNotice && (
          <div className="mb-8 flex items-center gap-2 rounded-xl border border-success/40 bg-success/15 px-4 py-2.5 text-xs font-semibold text-inverse-foreground">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            <span>{copiedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Column 1 — unit identity & mandate */}
          <div className="space-y-8 lg:col-span-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-primary/40 bg-primary/15 p-3 text-primary-on-inverse">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
                    Army Wing
                  </span>
                  <span className="rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-on-inverse">
                    19 JHR BN NCC
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold leading-tight tracking-tight text-inverse-foreground">
                  Sarala Birla University
                  <span className="block font-medium text-inverse-muted">Campus Company</span>
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-inverse-muted">
              Official Senior Division &amp; Senior Wing Army Wing NCC Company established at Sarala
              Birla University (SBU), Ranchi. Training cadets for B &amp; C Certificate
              examinations, military firing and national Republic Day (RDC) trials. Under NCC Group
              HQ Ranchi • Bihar &amp; Jharkhand Directorate • Ministry of Defence.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className={`${glassCard} inline-flex items-center gap-2 px-4 py-2`}>
                <span className="size-2 rounded-full bg-primary-on-inverse" aria-hidden="true" />
                <span className="numeric text-xs font-medium text-inverse-foreground">
                  160 SD/SW enrolled
                </span>
              </span>
              <span className={`${glassCard} inline-flex items-center gap-2 px-4 py-2`}>
                <span className="text-xs font-medium uppercase tracking-wider text-inverse-foreground">
                  Unity &amp; Discipline
                </span>
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-inverse-muted">
                ANO / officer command
              </p>
              <p className="mt-1 font-medium text-inverse-foreground">Lt. (Dr.) SBU Company</p>
            </div>
          </div>

          {/* Column 2 — campus office & battalion HQ */}
          <div className="space-y-10 lg:col-span-4">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionHeading}>
                  <MapPin className="size-4 text-primary-on-inverse" aria-hidden="true" />
                  <span>SBU campus office</span>
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

              <div className="space-y-2 text-sm text-inverse-muted">
                <p className="leading-relaxed">
                  Birla Knowledge City, Vill. Ara, P.O. Mahilong, Ranchi–Purulia Highway (NH 320),
                  Ranchi 835103
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-primary-on-inverse" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("7707004287", "SBU office phone")}
                    className={copyButtonClass}
                  >
                    +91 77070 04287 / +91 95251 10001
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-primary-on-inverse" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("info@sburanchi.ac.in", "SBU info email")}
                    className={copyButtonClass}
                  >
                    info@sburanchi.ac.in
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Globe className="size-4 shrink-0 text-primary-on-inverse" aria-hidden="true" />
                  <a
                    href="https://sbu.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-on-inverse transition-colors hover:text-inverse-foreground"
                  >
                    www.sbu.ac.in
                  </a>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionHeading}>
                  <Building2 className="size-4 text-primary-on-inverse" aria-hidden="true" />
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

              <div className="space-y-2 text-sm text-inverse-muted">
                <p className="leading-relaxed">
                  19 Jharkhand Battalion NCC, Sarhul Nagar, Lower Karamtoli, Ranchi, Jharkhand
                  834008
                </p>
                <p className="flex items-center gap-2 text-inverse-foreground/90">
                  <span className="text-inverse-muted">Plus Code:</span>
                  <span className="font-mono text-xs">98MR+M2F</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-primary-on-inverse" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("06512260480", "Battalion phone")}
                    className={copyButtonClass}
                  >
                    0651-2260480 (CO office)
                  </button>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-primary-on-inverse" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => handleCopyContact("co.19jhrbn@ncc.gov.in", "Battalion email")}
                    className={copyButtonClass}
                  >
                    co.19jhrbn@ncc.gov.in
                  </button>
                </p>
                <p className="text-xs">
                  Working hours:{" "}
                  <span className="font-medium text-inverse-foreground">
                    Mon–Sat, 09:00–17:00 IST
                  </span>
                </p>
              </div>
            </section>
          </div>

          {/* Column 3 — command chain & quick contacts */}
          <div className="space-y-10 lg:col-span-4">
            <section className="space-y-4">
              <h3 className={sectionHeading}>
                <Globe className="size-4 text-primary-on-inverse" aria-hidden="true" />
                <span>Group HQ &amp; Directorate</span>
              </h3>

              <div className="space-y-2 text-sm text-inverse-muted">
                <p className="leading-relaxed">
                  <strong className="font-medium text-inverse-foreground">
                    NCC Group HQ Ranchi:
                  </strong>{" "}
                  Kutchery Chowk / Morabadi Ground, Ranchi 834008
                </p>
                <p className="leading-relaxed">
                  <strong className="font-medium text-inverse-foreground">
                    NCC Directorate Bihar &amp; Jharkhand:
                  </strong>{" "}
                  CDA Building, Radhe Krishn Colony, Ghrounda, Patna, Bihar 800019
                  <span className="mt-0.5 block font-mono text-xs text-primary-on-inverse">
                    Plus Code: J44V+JC Patna
                  </span>
                </p>
                <p className="leading-relaxed">
                  <strong className="font-medium text-inverse-foreground">HQ DG NCC:</strong> West
                  Block-IV, R.K. Puram, New Delhi 110066
                </p>

                <div className="space-y-1.5 pt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=NCC+Directorate+Bihar+%26+Jharkhand+CDA+Building+Patna+800019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between text-sm font-medium text-primary-on-inverse transition-colors hover:text-inverse-foreground"
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
                    className="group/link flex items-center justify-between text-sm font-medium transition-colors hover:text-primary-on-inverse"
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

            {/* Quick contacts — primary action surface */}
            <section className="space-y-4 rounded-2xl border border-primary/20 bg-primary/10 p-6 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-on-inverse">
                  HQ Helpline
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyContact("0651-2260480", "Battalion HQ helpline")}
                  id="footer-battalion-helpline-btn"
                  className="numeric mt-1 text-xl font-semibold tracking-tight text-inverse-foreground transition-colors hover:text-primary-on-inverse"
                >
                  0651-2260480
                </button>
              </div>

              <div className="h-px w-full bg-inverse-border" aria-hidden="true" />

              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-inverse-muted">
                    Campus email
                  </dt>
                  <dd className="truncate text-xs text-inverse-foreground">info@sburanchi.ac.in</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-inverse-muted">
                    Total cadets
                  </dt>
                  <dd className="numeric text-xs text-inverse-foreground">160 SD/SW</dd>
                </div>
              </dl>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Sarala+Birla+University+Mahilong+Ranchi"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-sbu-map-directions-btn"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Navigation className="size-3.5" aria-hidden="true" />
                <span>SBU Campus Map</span>
              </a>
            </section>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-inverse-border pt-8 text-xs text-inverse-muted md:flex-row">
          <p className="order-2 text-center md:order-1 md:text-left">
            © {new Date().getFullYear()} 19 Jharkhand Battalion NCC • Sarala Birla University,
            Ranchi. All rights reserved.
          </p>

          <p className="order-1 inline-flex items-center gap-2 md:order-2">
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            <span className="font-medium text-primary-on-inverse">Unity &amp; Discipline</span>
            <span aria-hidden="true">•</span>
            <span>Ekta aur Anushasan</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
