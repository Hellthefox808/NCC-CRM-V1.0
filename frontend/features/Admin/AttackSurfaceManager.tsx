import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ShieldAlert,
  Globe,
  Network,
  Cpu,
  Search,
  Code2,
  Bug,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Lock,
  Radio,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Radar,
  Terminal,
} from "lucide-react";

export function AttackSurfaceManager() {
  const [activeStage, setActiveStage] = useState<string>("discovery");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>("System Secure • All Scanners Active");

  const runFullScan = () => {
    setIsScanning(true);
    setScanStatus("Running Multi-Engine Attack Surface Reconnaissance...");
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus("Scan Complete: Zero Critical Exposures Detected • Risk Score 12/100 (LOW)");
    }, 2400);
  };

  const STAGES = [
    {
      id: "scope",
      number: "01",
      title: "Target Scope Definition",
      icon: Globe,
      color: "text-blue-400",
      description: "Primary perimeter & asset scope boundaries for SBU NCC infrastructure.",
      tools: ["sbu.ac.in", "ncc.sbu.ac.in", "api.sbu-ncc.in", "Cloudflare CDN Edge"],
    },
    {
      id: "discovery",
      number: "02",
      title: "Asset Discovery",
      icon: Radar,
      color: "text-cyan-400",
      description: "Passive & active internet-wide asset discovery engines.",
      tools: ["Shodan", "Censys", "Netlas", "BinaryEdge", "ONYPHE", "ZoomEye", "IVRE"],
    },
    {
      id: "mapping",
      number: "03",
      title: "Relationship Mapping",
      icon: Network,
      color: "text-indigo-400",
      description: "Infrastructure topology, certificate chains & ASN correlation.",
      tools: [
        "DNS Topology",
        "WHOIS Guard",
        "SSL/TLS Certs",
        "ASN Mapping",
        "IP History",
        "Correlation Engine",
      ],
    },
    {
      id: "threat-intel",
      number: "04",
      title: "Threat Intelligence",
      icon: Radio,
      color: "text-amber-400",
      description: "Real-time threat feeds, honeypot telemetry & IP reputation.",
      tools: ["GreyNoise", "Pulsedive", "LeakIX", "FOFA", "SOCRadar", "URLScan.io"],
    },
    {
      id: "osint",
      number: "05",
      title: "OSINT Reconnaissance",
      icon: Search,
      color: "text-emerald-400",
      description: "Public intelligence, certificate transparency & footprinting.",
      tools: ["Intelligence X", "Hunter.io", "crt.sh", "WiGLE", "Google Dorks"],
    },
    {
      id: "code-intel",
      number: "06",
      title: "Code Intelligence",
      icon: FileCode2,
      color: "text-purple-400",
      description: "Source code leak detection, public API key & secret scanning.",
      tools: ["grep.app", "Searchcode", "PublicWWW", "GitGuardian Engine"],
    },
    {
      id: "vuln-intel",
      number: "07",
      title: "Vulnerability Intelligence",
      icon: Bug,
      color: "text-rose-400",
      description: "NVD CVE database, EPSS exploit prediction & CWE mapping.",
      tools: ["Vulners Engine", "NVD Database", "MITRE CVE", "EPSS Scoring", "CWE Taxonomy"],
    },
    {
      id: "defense",
      number: "08",
      title: "Defensive Decision Making",
      icon: ShieldCheck,
      color: "text-emerald-500",
      description: "Exposure assessment, risk prioritization & automated response.",
      tools: [
        "Exposure Analysis",
        "Risk Prioritization",
        "Incident Response",
        "Threat Hunting",
        "ASM Ops",
      ],
    },
  ];

  const EXPOSURE_METRICS = [
    { label: "Monitored Subdomains", value: "14 Assets", status: "Clean", icon: Globe },
    { label: "SSL/TLS Cert Validity", value: "Valid (284 Days)", status: "Active", icon: Lock },
    { label: "Open Port Exposure", value: "Ports 80, 443 Only", status: "Hardened", icon: Server },
    {
      label: "EPSS Exploit Probability",
      value: "0.012% (Negligible)",
      status: "Optimal",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#09090B] border border-blue-600/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Radar className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  Attack Surface & Cyber Threat Intelligence Architecture
                </h2>
                <p className="text-xs text-zinc-400">
                  Continuous Asset Reconnaissance, Vulnerability Intelligence & Defensive Operations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{scanStatus}</span>
            </div>
          </div>

          <button
            onClick={runFullScan}
            disabled={isScanning}
            className="bg-blue-500 hover:bg-blue-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning Surface..." : "Run Live ASM Scan"}</span>
          </button>
        </div>

        {/* Live Exposure Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {EXPOSURE_METRICS.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400">{metric.label}</span>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-sm font-black text-white">{metric.value}</p>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  ✓ {metric.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 8-Stage Architecture Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage List Sidebar */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider px-1">
            Pipeline Execution Flow
          </h3>

          <div className="space-y-2">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isSelected = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#09090B] border-blue-500 shadow-md text-white"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-zinc-400 w-5">{stage.number}</span>
                    <div
                      className={`p-2 rounded-lg ${isSelected ? "bg-blue-500/10 text-blue-400" : "bg-zinc-100 text-zinc-600"}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold">{stage.title}</p>
                      <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isSelected ? "text-blue-500 rotate-90" : "text-zinc-400"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="lg:col-span-7">
          {(() => {
            const current = STAGES.find((s) => s.id === activeStage) || STAGES[0];
            const Icon = current.icon;

            return (
              <div className="bg-[#09090B] border border-blue-600/30 rounded-2xl p-6 text-white space-y-6 shadow-xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                          STAGE {current.number} Pipeline Module
                        </span>
                        <h4 className="text-base font-black text-white">{current.title}</h4>
                      </div>
                    </div>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full">
                      Telemetry Active
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                    {current.description} All automated reconnaissance, mapping data, and
                    intelligence feeds are aggregated continuously in the SBU NCC Security Data
                    Engine.
                  </p>

                  <h5 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                    Integrated Security Engines & Tools
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {current.tools.map((tool, i) => (
                      <div
                        key={i}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-zinc-200">{tool}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span>Auto-scanned every 6 hours</span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-300">STATUS: OPTIMAL</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
