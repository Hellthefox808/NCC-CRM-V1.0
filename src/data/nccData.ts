import { ActivityCard, CampScheduleItem, NoticeItem, RankInfo } from "../types";

export const BATTALION_DETAILS = {
  unitName: "19 Jharkhand Battalion NCC",
  unitCode: "19 JHR BN NCC",
  wing: "Army Wing (Senior Division & Senior Wing)",
  groupHQ: "NCC Group Headquarters, Ranchi (Morabadi / Kutchery Range)",
  directorate: "Bihar & Jharkhand Directorate (Rajendra Path, Patna HQ)",
  institution: "Sarala Birla University, Ranchi",
  coyUnit: "SBU Company / Senior Platoon Unit",
  institutionLocation:
    "Birla Campus, Village Ara, P.O. Mahilong, Ranchi-Purulia Highway (NH 320), Namkum Block, Ranchi, Jharkhand - 835103",
  battalionHQLocation:
    "19 Jharkhand Battalion NCC, 98MR+M2F, Sarhul Nagar, Lower Karamtoli, Ranchi, Jharkhand - 834008",
  groupHQLocation: "NCC Group HQ, Morabadi / Kutchery Road, Ranchi, Jharkhand - 834008",
  directorateLocation: "NCC Directorate Bihar & Jharkhand, Rajendra Path, Patna, Bihar - 800019",
  commandingOfficer: "Col. Rohit Nandan Prasad (Commanding Officer, 19 JHR BN NCC)",
  administrativeOfficer: "Lt. Col. V. K. Rai (Administrative Officer)",
  associateNCCOfficer: "Prashant Kumar (ANO / CTO, SBU Unit)",
  permanentInstructors: "Subedar Major B. S. Gurung & Naib Subedar P. K. Thapa",
  seniorUnderOfficer: "SUO Aman Kumar Sharma",
  coyAllotmentStrength: "54 Cadets Allotment per Batch (SD Male & SW Female)",
  motto: "Unity and Discipline (Ekta aur Anushasan)",
  mottoHindi: "एकता और अनुशासन",
  pledge:
    "We the cadets of the National Cadet Corps, do solemnly pledge that we shall always uphold the unity of India. We resolve to be disciplined and responsible citizens of our nation.",
  nccSongTitle: "Hum Sab Bharatiya Hain (हम सब भारतीय हैं)",
  nccSongLyrics: `हम सब भारतीय हैं, हम सब भारतीय हैं
अपनी मंज़िल एक है, हा हा हा एक है, हो हो हो एक है
हम सब भारतीय हैं।

कश्मीर की घाटी जैसे, केरल का कावेरी
असम की बहती नदियाँ, गुजरात का रेगिस्तान
भाषा अनेक, रूप अनेक, पर देश हमारा एक है!

हम सब भारतीय हैं, हम सब भारतीय हैं!
शान हमारी एक है, मान हमारा एक है
आन हमारी एक है, हा हा हा एक है!`,
};

export const REAL_LOCATIONS_DATA = [
  {
    title: "Sarala Birla University NCC Coy Office",
    category: "Campus Company Office (SBU Unit)",
    address:
      "Birla Campus, Village Ara, P.O. Mahilong, Ranchi-Purulia Highway (NH 320), Namkum Block, Ranchi, Jharkhand - 835103",
    distance: "10.5 KM from Ranchi RNC Station • 14 KM from Birsa Munda Airport",
    landmark: "Opposite Knowledge City, Purulia Road, Mahilong",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Sarala+Birla+University+Mahilong+Ranchi+Jharkhand+835103",
    phone: "+91 (0651) 2261100 / +91 77070 04282",
    contactPerson: "Prashant Kumar (ANO / CTO, SBU Unit)",
    coordinates: "23.3524° N, 85.4291° E",
  },
  {
    title: "19 Jharkhand Battalion NCC HQ",
    category: "Battalion Headquarters (4.4 ★ Google Rating)",
    address:
      "19 Jharkhand Battalion NCC, Sarhul Nagar, Lower Karamtoli, Ranchi, Jharkhand - 834008 (Plus Code: 98MR+M2F)",
    distance: "2 KM from Kutchery Chowk • 4.5 KM from Ranchi Junction Station",
    landmark: "Sarhul Nagar / Lower Karamtoli, near Mission Hospital & Oval Sports Ground",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=19+Jharkhand+Battalion+NCC+Sarhul+Nagar+Ranchi+834008",
    phone: "+91 (0651) 2260480",
    contactPerson: "Col. Rohit Nandan Prasad (Commanding Officer)",
    coordinates: "23.3852° N, 85.3341° E",
  },
  {
    title: "NCC Group Headquarters, Ranchi",
    category: "Group HQ (Ranchi Range)",
    address: "NCC Group Headquarters, Morabadi / Kutchery Road, Ranchi, Jharkhand - 834008",
    distance: "4 KM from Ranchi Junction • Central Administrative Zone",
    landmark: "Adjacent to Morabadi Ground & Kutchery Chowk",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=NCC+Group+Headquarters+Morabadi+Ranchi+Jharkhand+834008",
    phone: "+91 (0651) 2208154",
    contactPerson: "Group Commander, Ranchi Group HQ",
    coordinates: "23.3812° N, 85.3214° E",
  },
  {
    title: "Bihar & Jharkhand NCC Directorate",
    category: "State Directorate HQ (4.1 ★ Google Rating)",
    address:
      "CDA Building, Radhe Krishn Colony, Ghrounda, Patna, Bihar - 800019 (Plus Code: J44V+JC)",
    distance: "Patna Central State HQ • 3.2 KM from Patna Junction",
    landmark: "CDA Building, Radhe Krishn Colony, Ghrounda, near Rajendra Path, Patna",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=NCC+Directorate+Bihar+%26+Jharkhand+CDA+Building+Patna+800019",
    phone: "+91 (0612) 2672341",
    contactPerson: "Additional Director General (ADG) NCC",
    coordinates: "25.6083° N, 85.1528° E",
  },
];

export const PHYSICAL_FITNESS_STANDARDS = {
  sdMale: {
    category: "Senior Division (SD - Male Cadets)",
    run: "1600 Meters (1.6 KM)",
    runTimeExcellent: "Under 6 Minutes 00 Seconds (100% Score)",
    runTimeGood: "6 Mins 01 Secs to 6 Mins 30 Secs (Qualifying)",
    pullups: "10 or more Pull-ups (Minimum 6 required)",
    pushups: "25+ Push-ups in 1 Minute",
    situps: "35+ Sit-ups in 1 Minute",
    minHeightCm: 157.5,
    minChestCm: "77 cm (Unexpanded) / 82 cm (Expanded - 5cm Expansion)",
    bmiRange: "18.5 - 24.9 (Normal Range)",
  },
  swFemale: {
    category: "Senior Wing (SW - Female Cadets)",
    run: "800 Meters",
    runTimeExcellent: "Under 4 Minutes 00 Seconds",
    runTimeGood: "4 Mins 01 Secs to 4 Mins 30 Secs",
    shuttleRun: "4 x 10m Shuttle Run test",
    flexedArmHang: "Flexed Arm Hang / Bent-Knee Sit-ups (25+ in 1 min)",
    minHeightCm: 152.0,
    bmiRange: "18.5 - 24.9 (Normal Range)",
  },
  medicalMandatory: [
    "Certified Medical Fitness Certificate by Registered MBBS Medical Officer",
    "No history of chronic asthma, epilepsy, color blindness, or severe flat foot",
    "Visual standard: 6/6 in better eye, 6/9 in worse eye (correctable to 6/6)",
  ],
};

export const EXAM_MARKS_AND_GRADING = {
  totalMarks: 500,
  writtenMarks: 350,
  practicalMarks: 150,
  passCriteria: "Minimum 45% in Written Theory, 45% in Practical, and 50% Aggregate overall.",
  grades: [
    {
      grade: "Grade 'A' (Alpha)",
      range: "70% & above (350+ out of 500 Marks)",
      perk: "Highest priority for SSB Direct Entry shortlisting & Military Academy",
    },
    {
      grade: "Grade 'B' (Beta)",
      range: "60% to 69.9% (300 to 349 Marks)",
      perk: "Fully eligible for Army NCC Special Entry Scheme SSB Interview",
    },
    {
      grade: "Grade 'C' (Charlie)",
      range: "50% to 59.9% (250 to 299 Marks)",
      perk: "Qualifies for State Police and Agniveer bonus points",
    },
  ],
  practicalStations: [
    "Drill & Words of Command (40 Marks)",
    "Weapon Handling & 0.22 Rifle Strip/Assemble (35 Marks)",
    "Map Reading & Prismatic Compass (35 Marks)",
    "Field Craft & Battle Craft (25 Marks)",
    "Viva Voce & Personality Assessment (15 Marks)",
  ],
};

export const SSB_SPECIAL_ENTRY_DETAILS = {
  schemeName: "NCC Special Entry Scheme (Indian Army)",
  cadre: "Short Service Commission (SSC Officer) - Officers Training Academy (OTA) Chennai",
  vacancies: "50 Vacancies twice a year (Male & Female Candidates)",
  noExamAdvantage: "No UPSC CDS written examination required for 'C' Certificate holders!",
  eligibility: [
    "Graduation Degree from a recognized University with minimum 50% aggregate marks",
    "Age Limit: 19 to 25 Years at the time of course commencement",
    "Served for minimum 2-3 years in NCC Senior Division / Senior Wing",
    "Obtained NCC 'C' Certificate with minimum Grade 'B' or Grade 'A'",
  ],
  selectionPhases: [
    "Phase 1: Merit Shortlisting based on Graduation % & NCC 'C' Grade",
    "Phase 2: 5-Day SSB Interview (Stage-1 Screening & Stage-2 Psychology/GTO/Interview)",
    "Phase 3: Medical Board Examination at Military Hospital",
    "Phase 4: 49-Week Pre-Commission Training at OTA Chennai",
  ],
};

export const CORE_VALUES = [
  {
    title: "National Unity",
    desc: "Fostering solidarity across diverse cultures, languages, religions, and regions of India.",
    icon: "ShieldCheck",
  },
  {
    title: "Selfless Service",
    desc: "Instilling 'Service Before Self' through community upliftment, disaster response, and blood donation drives.",
    icon: "HeartHandshake",
  },
  {
    title: "Leadership & Courage",
    desc: "Developing secular, brave, disciplined, and proactive youth leaders for the nation.",
    icon: "Award",
  },
  {
    title: "Patriotism & Honor",
    desc: "Dedication to upholding the honor of the Indian Armed Forces and the Tricolor Flag.",
    icon: "Flag",
  },
];

export const CERTIFICATE_BENEFITS = [
  {
    cert: "'C' Certificate (Alpha/Beta Grade)",
    benefits: [
      "Direct SSB Interview Entry for Army (NCC Special Entry Scheme - No written exam for CDS).",
      "Bonus marks (10 to 15 marks) in Agniveer Army, Navy, and Air Force recruitment exams.",
      "5% to 10% preference/bonus in State Police Force (Jharkhand Police, Bihar Police, CRPF, BSF, CISF).",
      "Preference in Post-Graduate admissions at premier Central Universities & Sarala Birla University.",
      "Corporate preference in Reliance, Tata, Security, and Logistics MNCs.",
    ],
  },
  {
    cert: "'B' Certificate",
    benefits: [
      "Bonus 6 to 10 marks in Indian Armed Forces soldier recruitment exams.",
      "Weightage in B.Tech, BCA, BBA, and MBA campus placement drives.",
      "Eligibility for Special Officer Cadre & State Police Services.",
      "Qualifies cadet to write the 'C' Certificate exam after completing 3rd year.",
    ],
  },
  {
    cert: "'A' Certificate (Junior Division)",
    benefits: [
      "Direct eligibility bonus points during Senior Division (SD/SW) enrollment at SBU Ranchi.",
      "Basic foundation in drill, map reading, and 0.22 Deluxe Rifle marksmanship.",
    ],
  },
];

export const ACTIVITIES_DATA: ActivityCard[] = [
  {
    id: "act-1",
    title: "VIP Escort & Ceremonial Guard of Honor",
    category: "Institutional",
    description:
      "VIP Escort & Red Carpet Guard of Honor led by 19 JHR BN NCC cadets for University Leadership, Commanding Officer, & Dignitaries at SBU Ranchi.",
    image: "/images/activities/vip_guard_escort.jpg",
    highlights: [
      "Red Carpet VIP Escort",
      "Ceremonial Guard of Honor",
      "Commanding Officer & Dignitary Reception",
      "Precision Drill & Bearing",
    ],
  },
  {
    id: "act-2",
    title: "National Youth Day 2026 Felicitation & Camp",
    category: "Camps",
    description:
      "National Youth Day 2026 (राष्ट्रीय युवा दिवस) mega camp, red cross youth awareness, and certificate felicitation ceremony honoring top cadets.",
    image: "/images/activities/national_youth_day_awards.jpg",
    highlights: [
      "National Youth Day 2026",
      "Cadet Certificate & Medal Awards",
      "Red Cross & Youth Empowerment",
      "19th JH BN NCC Battalion Event",
    ],
  },
  {
    id: "act-3",
    title: "Tiranga Yatra & National Unity Rally",
    category: "Social Service",
    description:
      "Mass Patriotic Tiranga Yatra led by SBU Chancellor, Vice Chancellor, Faculty, and NCC Cadets marching across green campus avenues with Indian flags.",
    image: "/images/activities/tiranga_yatra_rally.jpg",
    highlights: [
      "Tiranga Yatra Flag Rally",
      "Patriotic Mass Marching",
      "University Leadership Participation",
      "National Integration Drive",
    ],
  },
  {
    id: "act-4",
    title: "International Yoga Day & Physical Wellness",
    category: "Institutional",
    description:
      "Special International Yoga Day & Mindful Fitness workshop conducted on SBU Auditorium stage with 19th JH BN NCC cadets on yoga mats.",
    image: "/images/activities/yoga_day_wellness.jpg",
    highlights: [
      "International Yoga Day Asanas",
      "Physical & Mental Fitness",
      "Auditorium Stage Session",
      "Cadet Wellness Practice",
    ],
  },
  {
    id: "act-5",
    title: "Company Parade & Squad Formation",
    category: "Institutional",
    description:
      "Parade drill, squad formation, and inspection sessions on SBU campus ground led by 19 Jharkhand Battalion NCC officers and cadet rank holders.",
    image: "/images/activities/ncc_squad_formation.jpg",
    highlights: [
      "Parade Drill & Squad Alignment",
      "Uniform & Epaulette Inspection",
      "Amphitheater Drill Formations",
      "Command & Military Bearing",
    ],
  },
  {
    id: "act-6",
    title: "Classical Dance & Women Empowerment Event",
    category: "Camps",
    description:
      "Cultural presentation on Women Empowerment on World Youth Skills Day organized under 19th Jharkhand Battalion NCC at SBU Ranchi.",
    image: "/images/activities/cultural_dance_youth_day.jpg",
    highlights: [
      "Classical Dance Performance",
      "World Youth Skills Day Event",
      "Women Empowerment Theme",
      "19th JH BN NCC Stage Program",
    ],
  },
  {
    id: "act-7",
    title: "Swachh Bharat Cleanliness Campaign",
    category: "Social Service",
    description:
      "Swachh Bharat Abhiyan drive organized by SBU Cadets featuring hand-made awareness posters, slogans, and hygiene exhibitions.",
    image: "/images/activities/swachh_bharat_posters.jpg",
    highlights: [
      "Poster & Slogan Competition",
      "Sarala Birla Public School Drive",
      "Hygiene & Environmental Awareness",
      "Cadet Volunteer Action",
    ],
  },
  {
    id: "act-8",
    title: "Community Awareness Rally & March",
    category: "Social Service",
    description:
      "Public awareness march by 19 JHR BN cadets advocating social causes, environmental protection, and national unity through Namkum & SBU routes.",
    image: "/images/activities/awareness_rally_march.jpg",
    highlights: [
      "Awareness Rally March",
      "Placards & Slogan Displays",
      "Social Cause Outreach",
      "Mass Community Engagement",
    ],
  },
  {
    id: "act-9",
    title: "Road Sanitation & Cleanliness Drive",
    category: "Social Service",
    description:
      "Active community cleanliness drive by NCC cadets cleaning public roads and university surroundings to support National Cleanliness Mission.",
    image: "/images/activities/swachh_bharat_cleaning.jpg",
    highlights: [
      "Shramdaan & Waste Segregation",
      "Roadside Cleanliness Campaign",
      "Swachhata Pakhwada Participation",
      "Public Health Initiative",
    ],
  },
  {
    id: "act-10",
    title: "0.22 Rifle Marksmanship & Range Firing",
    category: "Shooting",
    description:
      "Hands-on marksmanship training, firing stance posture, and live shooting using 0.22 Deluxe Rifle  at Battalion Firing Range.",
    image: "/images/activities/rifle_shooting_range.jpg",
    highlights: [
      "0.22 Deluxe Rifle Marksmanship",
      "Kneeling & Lying Firing Postures",
      "Grouping & Snap Shooting",
      "Inter-Battalion Shooting Championship",
    ],
  },
  {
    id: "act-11",
    title: "High Altitude Trekking & Parasailing Expeditions",
    category: "Adventure",
    description:
      "High-intensity adventure training including Netarhat hill trekking expeditions, parasailing, and obstacle survival courses conducted under Bihar & Jharkhand Dte.",
    image: "/images/activities/ncc_mountain_trekking.jpg",
    highlights: [
      "Netarhat Hill Trekking",
      "Obstacle Course & Rappelling",
      "Parasailing Trials",
      "Outdoor Survival & Navigation",
    ],
  },
];

export const RANKS_DATA: RankInfo[] = [
  {
    rank: "Senior Under Officer",
    abbr: "SUO",
    insignia: "3 Epaulette Bars (Gold/Navy)",
    responsibilities:
      "Highest ranking cadet leader of SBU Coy. Commands whole unit during parades & coordinates with ANO & Commanding Officer.",
    level: "Senior Level 1",
  },
  {
    rank: "Under Officer",
    abbr: "UO",
    insignia: "2 Epaulette Bars",
    responsibilities:
      "Assists SUO in company management, parade drill discipline, roll call, and camp documentation.",
    level: "Senior Level 2",
  },
  {
    rank: "Company Sergeant Major",
    abbr: "CSM",
    insignia: "Wrist Arm Badge",
    responsibilities:
      "In charge of battalion discipline, parade turnout inspection, drill equipment, and stores.",
    level: "Senior Level 3",
  },
  {
    rank: "Sergeant",
    abbr: "Sgt",
    insignia: "3 Arm Chevrons",
    responsibilities:
      "Platoon section commander guiding junior cadets during squad drill and physical training.",
    level: "Intermediate Level",
  },
  {
    rank: "Corporal",
    abbr: "Cpl",
    insignia: "2 Arm Chevrons",
    responsibilities:
      "Squad leader assisting in attendance, uniform inspection, and sports activities.",
    level: "Junior NCO",
  },
  {
    rank: "Lance Corporal",
    abbr: "L/Cpl",
    insignia: "1 Arm Chevron",
    responsibilities:
      "First rank after cadet selection showing leadership aptitude during 1st/2nd year.",
    level: "Junior NCO",
  },
  {
    rank: "Cadet",
    abbr: "Cdt",
    insignia: "Standard Shoulder Title (19 JHR BN)",
    responsibilities:
      "Newly enrolled trainee undergoing institutional training, drill, theory, and shooting.",
    level: "Basic Entry",
  },
];

export const NOTICES_DATA: NoticeItem[] = [
  {
    id: "not-1",
    date: "2026-08-01",
    title: "Online Enrollment Open for Academic Session 2026-27 (SD & SW)",
    category: "Enrollment",
    isImportant: true,
    description:
      "Applications are invited from 1st Year regular students of SBU Ranchi (B.Tech, BCA, BBA, B.Sc, MBA, BA, Diploma). Fill online form on or before 15th August 2026.",
  },
  {
    id: "not-2",
    date: "2026-07-28",
    title: "Physical Test & Medical Screening Schedule at SBU Ground",
    category: "Enrollment",
    isImportant: true,
    description:
      "Physical efficiency test (1600m run, pushups, height/weight measurement) for registered applicants will be held on 18th August 2026 at 06:00 AM sharp.",
  },
  {
    id: "not-3",
    date: "2026-07-15",
    title: "CATC-10 Combined Annual Training Camp Nomination Roll",
    category: "Camp",
    isImportant: false,
    description:
      "Cadets selected for CATC-10 at Khel Gaon Ranchi must submit parent consent form and bank passbook photocopy to ANO office by 10th August.",
  },
  {
    id: "not-4",
    date: "2026-07-02",
    title: "NCC 'B' & 'C' Certificate Written Exam Answer Key & Marks Review",
    category: "Exam",
    isImportant: false,
    description:
      "Official results for Certificate 'B' and 'C' examinations conducted under Bihar & Jharkhand Dte are published. Contact SUO for marksheet collection.",
  },
];

export const CAMPS_DATA: CampScheduleItem[] = [
  {
    id: "cmp-catc",
    name: "Combined Annual Training Camp",
    shortCode: "CATC",
    campType: "Mandatory Certificate Camp",
    level: "Battalion",
    location: "Khel Gaon Stadium, Hotwar, Ranchi (19 JHR BN NCC)",
    duration: "10 Days • Full Residential",
    conductedBy: "19 Jharkhand Battalion NCC, Ranchi",
    eligibility: "1st & 2nd Year enrolled cadets — mandatory for 'B' / 'C' Certificate",
    status: "Upcoming",
    vacancies: 45,
    modules: [
      "Squad & Ceremonial Drill",
      "0.22 Rifle Firing",
      "Map Reading",
      "Field Craft",
      "Obstacle Training",
    ],
    incentive: "Counts as one mandatory ATC towards Certificate eligibility",
    image: "/images/activities/ncc_squad_formation.jpg",
  },
  {
    id: "cmp-atc",
    name: "Annual Training Camp",
    shortCode: "ATC",
    campType: "Institutional Training Camp",
    level: "Institutional",
    location: "Sarala Birla University Campus Ground, Mahilong, Ranchi",
    duration: "7 Days • Day-scholar & Residential mix",
    conductedBy: "SBU NCC Coy under ANO Prashant Kumar",
    eligibility: "All enrolled SD / SW cadets of SBU Company",
    status: "Upcoming",
    vacancies: 54,
    modules: [
      "Drill & Words of Command",
      "PT & Physical Efficiency",
      "Weapon Training",
      "Health & Hygiene",
    ],
    incentive: "Attendance credited toward the 75% parade requirement",
    image: "/images/activities/vip_guard_escort.jpg",
  },
  {
    id: "cmp-tsc",
    name: "Thal Sainik Camp (Pre-TSC & TSC)",
    shortCode: "TSC",
    campType: "Competition Camp — Army Wing",
    level: "National",
    location: "Selection at Namkum Military Station • Finals at Delhi Cantt",
    duration: "12 Days • Selection trials followed by national finals",
    conductedBy: "Bihar & Jharkhand Directorate / DG NCC",
    eligibility: "Cadets selected in firing, map reading, judging distance & obstacle events",
    status: "Upcoming",
    vacancies: 15,
    modules: [
      "Firing Competition",
      "Map Reading",
      "Judging Distance",
      "Obstacle Course",
      "Line Area Turnout",
    ],
    incentive: "Directorate blazer, national exposure & DG NCC merit certificate",
    image: "/images/activities/rifle_shooting_range.jpg",
  },
  {
    id: "cmp-rdc",
    name: "Republic Day Camp (Pre-RDC & RDC)",
    shortCode: "RDC",
    campType: "Prestige Camp — Delhi",
    level: "National",
    location: "Group HQ Ranchi & Patna trials • Garrison Parade Ground, Delhi",
    duration: "Multi-stage selection • 30 Days at RDC Delhi",
    conductedBy: "DG NCC, Ministry of Defence",
    eligibility: "Senior Division & Senior Wing drill champions cleared through 4 selection stages",
    status: "Upcoming",
    vacancies: 8,
    modules: [
      "Guard of Honour Drill",
      "PM Rally Contingent",
      "Flag Area Presentation",
      "Cultural Programme",
    ],
    incentive: "Prime Minister's Rally, Raksha Mantri Padak & Best Cadet medals",
    image: "/images/activities/tiranga_yatra_rally.jpg",
  },
  {
    id: "cmp-ebsb",
    name: "Ek Bharat Shreshtha Bharat National Integration Camp",
    shortCode: "EBSB NIC",
    campType: "National Integration Camp",
    level: "National",
    location: "Gaya Cantt, Bihar Directorate & partner state directorates",
    duration: "10 Days • Inter-state cadet exchange",
    conductedBy: "NCC Directorate Bihar & Jharkhand",
    eligibility: "Cadets nominated for cultural, heritage and rifle drill representation",
    status: "Upcoming",
    vacancies: 12,
    modules: ["Cultural Exchange", "Heritage Study Visits", "Guest Lectures", "Inter-State Drill"],
    incentive: "Paired-state cultural exposure & integration certificate",
    image: "/images/activities/cultural_dance_youth_day.jpg",
  },
  {
    id: "cmp-aac",
    name: "Army Attachment Camp",
    shortCode: "AAC",
    campType: "Regular Army Attachment",
    level: "Directorate",
    location: "Attachment with Army units at Ranchi / Danapur Cantonment",
    duration: "14 Days • Attached to a serving Army unit",
    conductedBy: "Regular Army units through 19 JHR BN NCC",
    eligibility: "Third year SD cadets holding 'B' Certificate with good bearing",
    status: "Upcoming",
    vacancies: 20,
    modules: [
      "Unit Life & Routine",
      "Weapon Demonstrations",
      "Regimental History",
      "Officer Interaction",
    ],
    incentive: "Direct exposure to service life ahead of SSB screening",
    image: "/images/activities/national_youth_day_awards.jpg",
  },
  {
    id: "cmp-lc",
    name: "Advance Leadership & Basic Leadership Camp",
    shortCode: "ALC / BLC",
    campType: "Leadership Development Camp",
    level: "Group",
    location: "NCC Group Headquarters, Morabadi, Ranchi",
    duration: "9 Days • Rank holder capsule",
    conductedBy: "NCC Group HQ Ranchi",
    eligibility: "Cadet rank holders — SUO, UO, CSM, Sergeant and Corporal",
    status: "Upcoming",
    vacancies: 18,
    modules: [
      "Command Tasks",
      "Group Discussion & Lecturette",
      "Man Management",
      "Camp Administration",
    ],
    incentive: "Rank promotion consideration & SSB-style task practice",
    image: "/images/activities/yoga_day_wellness.jpg",
  },
  {
    id: "cmp-adv",
    name: "Adventure Training Camp — Trekking, Rock Climbing & Para Sailing",
    shortCode: "ADV",
    campType: "Adventure Activity Camp",
    level: "Directorate",
    location: "Netarhat & Patratu Hills, Jharkhand • Himalayan trek routes",
    duration: "12 Days • High altitude & obstacle training",
    conductedBy: "Bihar & Jharkhand Directorate Adventure Cell",
    eligibility: "Physically fit senior cadets with medical fitness certificate",
    status: "Upcoming",
    vacancies: 10,
    modules: ["Hill Trekking", "Rock Climbing & Rappelling", "Para Sailing", "Survival Navigation"],
    incentive: "Adventure completion certificate & camp gear allowance",
    image: "/images/activities/ncc_mountain_trekking.jpg",
  },
  {
    id: "cmp-snic",
    name: "Special National Integration Camp",
    shortCode: "SNIC",
    campType: "Special Integration Camp",
    level: "National",
    location: "Rotating host directorates across India",
    duration: "10 Days • All-India cadet participation",
    conductedBy: "DG NCC through host directorate",
    eligibility: "Cadets with outstanding camp record nominated by the Battalion",
    status: "Upcoming",
    vacancies: 6,
    modules: [
      "National Integration Lectures",
      "Youth Exchange",
      "Community Outreach",
      "Cultural Evening",
    ],
    incentive: "All-India exposure with rail travel warrant & mess allowance",
    image: "/images/activities/awareness_rally_march.jpg",
  },
  {
    id: "cmp-ssc",
    name: "Social Service & Swachhata Camp",
    shortCode: "SSC",
    campType: "Community Service Camp",
    level: "Institutional",
    location: "Namkum Block villages, Mahilong & SBU adopted areas",
    duration: "5 Days • Shramdaan & outreach",
    conductedBy: "SBU NCC Coy with 19 JHR BN NCC",
    eligibility: "Open to all enrolled cadets of SBU Company",
    status: "Active",
    vacancies: 54,
    modules: [
      "Swachh Bharat Shramdaan",
      "Blood Donation Drive",
      "Tree Plantation",
      "Awareness Rally",
    ],
    incentive: "Social service hours credited in cadet service record",
    image: "/images/activities/swachh_bharat_cleaning.jpg",
  },
];

export const SYLLABUS_TOPICS = [
  {
    subject: "Common Subjects",
    topics: [
      "The NCC - History, Aims, Organization, Incentives",
      "National Integration & Awareness - Indian history, culture, unity in diversity",
      "Drill - Words of command, Squad drill, Salutes, Ceremonial drill",
      "Weapon Training - Characteristics of 0.22 Rifle, SLR, Strip/Assemble, Firing positions",
      "Personality Development & Leadership - Leadership traits, Communication skills, Time management",
      "Disaster Management - Firefighting, Civil defense, First aid, Flood relief",
      "Social Service & Community Development - Blood donation, Swachh Bharat, Rural sanitation",
      "Health & Hygiene - Sanitation, Infectious diseases, Physical fitness",
    ],
  },
  {
    subject: "Specialized Army Wing Subjects",
    topics: [
      "Armed Forces - Organization of Army, Navy, Air Force, Ranks & Badges, Honors & Awards",
      "Map Reading - Conventional signs, Grid reference, Prismatic compass, Finding own position",
      "Field Craft & Battle Craft - Camouflage & Concealment, Distance estimation, Field signals, Patrols",
      "Military History - Famous Indian wars (1965, 1971 Kargil), PVC winners, Field Marshal Cariappa",
      "Communication - Basic radio telephony, Military wireless sets, Signals procedures",
    ],
  },
];
