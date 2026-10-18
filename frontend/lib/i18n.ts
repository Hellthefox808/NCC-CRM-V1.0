/**
 * NCC CRM Internationalization (i18n) & Localization (L10n) Engine
 * 19 Jharkhand Battalion NCC (Sarala Birla University Sub-Unit)
 *
 * Implements type-safe locale management, dictionary lookups, parameter interpolation,
 * pluralization, and Intl-backed currency/date/number formatting.
 * Supported Locales:
 *  - "en": English (Official Defence Administration)
 *  - "hi": हिन्दी (National Language & Cadet Command)
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react";

export type SupportedLocale = "en" | "hi";

export interface LocaleMetadata {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
  },
};

export const DEFAULT_LOCALE: SupportedLocale = "en";
const STORAGE_KEY = "ncc_preferred_locale";

// Typed Localization Dictionaries
export const DICTIONARIES = {
  en: {
    // Common terms
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.search": "Search...",
    "common.filter": "Filter",
    "common.view": "View",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.submit": "Submit",
    "common.confirm": "Confirm",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.refresh": "Refresh",
    "common.export": "Export",

    // Organization & Unit Context
    "org.ncc_title": "National Cadet Corps",
    "org.unit_name": "19 Jharkhand Battalion NCC",
    "org.institution": "Sarala Birla University, Ranchi",
    "org.motto": "Unity and Discipline",
    "org.motto_sub": "Ekta aur Anushasan",

    // Navigation Modules
    "nav.dashboard": "Command Dashboard",
    "nav.cadets": "Nominal Roll CRM",
    "nav.enrollments": "Enrollment Pipeline",
    "nav.attendance": "Parade Attendance",
    "nav.camps": "Annual Training Camps",
    "nav.training": "Drill & Weapon Training",
    "nav.discipline": "Discipline & Honours",
    "nav.notices": "Battalion Orders & Notices",
    "nav.messages": "Cadre Collaboration Hub",
    "nav.reports": "Command Reports",
    "nav.settings": "Unit Settings",
    "nav.security": "Security & IDS Monitor",

    // Cadre Collaboration & Chat
    "chat.hub_title": "Cadre Collaboration Hub",
    "chat.direct_messages": "Direct Messages",
    "chat.group_chats": "Platoon & Squad Groups",
    "chat.official_channels": "Battalion Broadcasts",
    "chat.search_placeholder": "Search conversations, orders, or cadre...",
    "chat.type_message": "Type a message or regimental order...",
    "chat.send": "Send",
    "chat.reply": "Reply",
    "chat.pin": "Pin Order",
    "chat.unpin": "Unpin Order",
    "chat.create_poll": "Create Poll",
    "chat.convert_task": "Convert to Task",
    "chat.add_cadet": "Add Cadet to Group",
    "chat.pinned_orders": "Pinned Orders & Notices",
    "chat.cadre_members": "Cadre Members",
    "chat.online": "Online",
    "chat.offline": "Offline",
    "chat.typing": "is typing...",

    // Cadet Records & Profile
    "cadet.reg_no": "Regimental Number",
    "cadet.full_name": "Cadet Full Name",
    "cadet.rank": "Rank",
    "cadet.wing": "Wing",
    "cadet.sd": "Senior Division (SD)",
    "cadet.sw": "Senior Wing (SW)",
    "cadet.fitness_score": "Fitness Assessment",
    "cadet.application_status": "Enrollment Status",
  },
  hi: {
    // Common terms
    "common.save": "सुरक्षित करें",
    "common.cancel": "रद्द करें",
    "common.close": "बंद करें",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि उत्पन्न हुई",
    "common.success": "सफल",
    "common.search": "खोजें...",
    "common.filter": "फ़िल्टर",
    "common.view": "देखें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.submit": "जमा करें",
    "common.confirm": "पुष्टि करें",
    "common.actions": "कार्रवाई",
    "common.status": "स्थिति",
    "common.refresh": "ताज़ा करें",
    "common.export": "निर्यात करें",

    // Organization & Unit Context
    "org.ncc_title": "राष्ट्रीय कैडेट कोर",
    "org.unit_name": "19 झारखंड बटालियन एनसीसी",
    "org.institution": "सरला बिरला विश्वविद्यालय, रांची",
    "org.motto": "एकता और अनुशासन",
    "org.motto_sub": "एकता और अनुशासन",

    // Navigation Modules
    "nav.dashboard": "कमांड डैशबोर्ड",
    "nav.cadets": "कैडेट नामावली (CRM)",
    "nav.enrollments": "नामांकन प्रक्रिया",
    "nav.attendance": "परेड उपस्थिति",
    "nav.camps": "वार्षिक प्रशिक्षण शिविर",
    "nav.training": "ड्रिल एवं शस्त्र प्रशिक्षण",
    "nav.discipline": "अनुशासन एवं सम्मान",
    "nav.notices": "बटालियन आदेश एवं सूचनाएं",
    "nav.messages": "कैडर संचार केंद्र",
    "nav.reports": "कमांड रिपोर्ट",
    "nav.settings": "इकाई सेटिंग्स",
    "nav.security": "सुरक्षा एवं IDS मॉनिटर",

    // Cadre Collaboration & Chat
    "chat.hub_title": "कैडर संचार एवं सहयोग केंद्र",
    "chat.direct_messages": "प्रत्यक्ष संदेश (DM)",
    "chat.group_chats": "प्लाटून एवं दस्ता समूह",
    "chat.official_channels": "बटालियन आधिकारिक प्रसारण",
    "chat.search_placeholder": "वार्तालाप, आदेश या कैडेट खोजें...",
    "chat.type_message": "संदेश अथवा रेजिमेंटल आदेश टाइप करें...",
    "chat.send": "भेजें",
    "chat.reply": "उत्तर दें",
    "chat.pin": "आदेश पिन करें",
    "chat.unpin": "आदेश अनपिन करें",
    "chat.create_poll": "मतदान (Poll) बनाएं",
    "chat.convert_task": "कार्य (Task) में बदलें",
    "chat.add_cadet": "कैडेट को समूह में जोड़ें",
    "chat.pinned_orders": "पिन किए गए आदेश एवं सूचनाएं",
    "chat.cadre_members": "कैडर सदस्य",
    "chat.online": "सक्रिय (ऑनलाइन)",
    "chat.offline": "निष्क्रिय (ऑफ़लाइन)",
    "chat.typing": "टाइप कर रहे हैं...",

    // Cadet Records & Profile
    "cadet.reg_no": "रेजिमेंटल संख्या",
    "cadet.full_name": "कैडेट का पूरा नाम",
    "cadet.rank": "पद (Rank)",
    "cadet.wing": "विंग",
    "cadet.sd": "सीनियर डिवीजन (पुरुष)",
    "cadet.sw": "सीनियर विंग (महिला)",
    "cadet.fitness_score": "शारीरिक स्वास्थ्य मूल्यांकन",
    "cadet.application_status": "नामांकन स्थिति",
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARIES.en;

// Runtime state storage for SSR and client
let currentLocale: SupportedLocale = DEFAULT_LOCALE;

/**
 * Get the currently active locale
 */
export function getLocale(): SupportedLocale {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      if (saved && saved in SUPPORTED_LOCALES) {
        currentLocale = saved;
      }
    } catch {
      // LocalStorage access fallback
    }
  }
  return currentLocale;
}

/**
 * Set the currently active locale and persist to storage
 */
export function setLocale(locale: SupportedLocale): void {
  if (locale in SUPPORTED_LOCALES) {
    currentLocale = locale;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = SUPPORTED_LOCALES[locale].direction;
      } catch {
        // LocalStorage access fallback
      }
    }
  }
}

/**
 * Translate a key with optional dynamic variable interpolation
 * Example: t("chat.hub_title") or t("custom.key", { count: 5 })
 */
export function t(
  key: TranslationKey | string,
  params?: Record<string, string | number>,
  overrideLocale?: SupportedLocale,
): string {
  const loc = overrideLocale || getLocale();
  const dict = DICTIONARIES[loc] || DICTIONARIES.en;

  let translation: string = (dict as Record<string, string>)[key];

  // Fallback to English if translation is missing in selected locale
  if (!translation && loc !== "en") {
    translation = (DICTIONARIES.en as Record<string, string>)[key];
  }

  // If still missing, return key itself
  if (!translation) {
    return key;
  }

  // Parameter interpolation: {varName} -> value
  if (params) {
    for (const [varName, val] of Object.entries(params)) {
      translation = translation.replace(new RegExp(`\\{${varName}\\}`, "g"), String(val));
    }
  }

  return translation;
}

/**
 * Format date in the current or specified locale
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  overrideLocale?: SupportedLocale,
): string {
  const loc = overrideLocale || getLocale();
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Intl.DateTimeFormat(loc === "hi" ? "hi-IN" : "en-IN", defaultOptions).format(d);
}

/**
 * Format numbers according to Indian numbering system (e.g. 1,00,000)
 */
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions,
  overrideLocale?: SupportedLocale,
): string {
  const loc = overrideLocale || getLocale();
  return new Intl.NumberFormat(loc === "hi" ? "hi-IN" : "en-IN", options).format(num);
}

/**
 * React Context for i18n
 */
interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  isRTL: boolean;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t,
  formatDate,
  formatNumber,
  isRTL: false,
});

/**
 * React Hook for consuming i18n inside components
 */
export function useI18n(): I18nContextValue {
  const [localeState, setLocaleState] = useState<SupportedLocale>(() => getLocale());

  const handleSetLocale = useCallback((newLoc: SupportedLocale) => {
    setLocale(newLoc);
    setLocaleState(newLoc);
  }, []);

  useEffect(() => {
    const active = getLocale();
    if (active !== localeState) {
      setLocaleState(active);
    }
  }, [localeState]);

  const translate = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>) => {
      return t(key, params, localeState);
    },
    [localeState],
  );

  const formatD = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      return formatDate(date, options, localeState);
    },
    [localeState],
  );

  const formatN = useCallback(
    (num: number, options?: Intl.NumberFormatOptions) => {
      return formatNumber(num, options, localeState);
    },
    [localeState],
  );

  return {
    locale: localeState,
    setLocale: handleSetLocale,
    t: translate,
    formatDate: formatD,
    formatNumber: formatN,
    isRTL: SUPPORTED_LOCALES[localeState].direction === "rtl",
  };
}
