// Mock responses for the provider pages (My Patients, patient details, sign-off, notifications).
// Returns undefined for anything it does not own so other handlers can respond.

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n, hour = 14) => {
  const d = new Date(Date.now() - n * DAY);
  d.setUTCHours(hour, 15, 0, 0);
  return d.toISOString();
};

const mockRole = () => {
  try {
    return localStorage.getItem("mockRole") || "admin";
  } catch (e) {
    return "admin";
  }
};

const coaches = [
  { _id: "coach-1", first_name: "Olivia", middle_name: "", last_name: "Bennett", name: "Olivia Bennett", email: "olivia.bennett@reviveease.com", profile_img: "" },
  { _id: "coach-2", first_name: "Marcus", middle_name: "J", last_name: "Reed", name: "Marcus Reed", email: "marcus.reed@reviveease.com", profile_img: "" },
  { _id: "coach-3", first_name: "Priya", middle_name: "", last_name: "Nair", name: "Priya Nair", email: "priya.nair@reviveease.com", profile_img: "" },
];

const seed = [
  ["James", "R", "Carter", "male", "Chronic Low Back Pain", "Medicare", "Austin", "TX", 162],
  ["Maria", "L", "Gonzalez", "female", "Fibromyalgia", "Blue Cross Blue Shield", "Dallas", "TX", 141],
  ["Robert", "", "Nguyen", "male", "Cervical Radiculopathy", "Aetna", "Houston", "TX", 128],
  ["Linda", "M", "Thompson", "female", "Knee Osteoarthritis", "UnitedHealthcare", "Plano", "TX", 117],
  ["David", "A", "Patel", "male", "Lumbar Spinal Stenosis", "Cigna", "Frisco", "TX", 104],
  ["Susan", "", "Walker", "female", "Chronic Migraine", "Medicare", "Irving", "TX", 96],
  ["Michael", "T", "Brooks", "male", "Rotator Cuff Tendinopathy", "Humana", "Round Rock", "TX", 83],
  ["Karen", "E", "Mitchell", "female", "Sciatica", "Aetna", "San Antonio", "TX", 71],
  ["Thomas", "", "Rivera", "male", "Post-Laminectomy Syndrome", "Blue Cross Blue Shield", "Arlington", "TX", 64],
  ["Patricia", "D", "Hughes", "female", "Hip Osteoarthritis", "Medicare", "Fort Worth", "TX", 52],
  ["Daniel", "K", "Foster", "male", "Chronic Neck Pain", "Cigna", "Garland", "TX", 39],
  ["Nancy", "", "Sullivan", "female", "Complex Regional Pain Syndrome", "UnitedHealthcare", "McKinney", "TX", 27],
  ["Christopher", "B", "Ward", "male", "Plantar Fasciitis", "Humana", "Denton", "TX", 18],
  ["Barbara", "J", "Price", "female", "Chronic Low Back Pain", "Medicare", "Waco", "TX", 9],
];

const patients = seed.map(([first_name, middle_name, last_name, gender, diagnosis, insurance, city, state, age], i) => ({
  _id: `patient-${i + 1}`,
  patient_id: `RE-${1042 + i * 7}`,
  first_name,
  middle_name,
  last_name,
  name: `${first_name} ${last_name}`,
  email: `${first_name}.${last_name}@mailinator.com`.toLowerCase(),
  phone: `(512) 555-01${String(10 + i).padStart(2, "0")}`,
  gender,
  diagnosis,
  product: /migraine/i.test(diagnosis) ? "Migraine App" : "Pain App",
  insurance,
  address_line_1: `${120 + i * 17} Oak Ridge Dr`,
  city,
  state,
  zip_code: `75${String(100 + i * 13)}`,
  status: "active",
  clinic_id: "clinic-1",
  clinic_name: "Lone Star Pain & Spine",
  profile_img: "",
  coach: coaches[i % coaches.length],
  provider: { _id: "mock-user-1", first_name: "Demo", last_name: "User", md_type: "Dr" },
  iswatchlisted: i % 4 === 0,
  createdAt: daysAgo(age),
  updatedAt: daysAgo(i % 6),
}));

// Patients waiting for provider approval (Pending Approval tab).
const pendingPatients = [
  ["Katty", "", "Jason", "female", "", "Migraine App", "Private"],
  ["Arnold", "", "Bliss", "male", "", "Migraine App", "Other"],
  ["Moirain", "", "Sedai", "female", "Meniscus Tear", "Migraine App", "Medicare"],
  ["Sam", "", "Smith", "male", "Sciatica", "Pain App", "Medicare"],
].map(([first_name, middle_name, last_name, gender, diagnosis, product, insurance], i) => ({
  _id: `pending-${i + 1}`,
  patient_id: `RE-2${100 + i * 3}`,
  first_name,
  middle_name,
  last_name,
  name: `${first_name} ${last_name}`,
  email: `${first_name}.${last_name}@mailinator.com`.toLowerCase(),
  gender,
  diagnosis,
  product,
  insurance,
  status: "pending",
  clinic_id: "clinic-1",
  coach: i % 2 === 0 ? null : coaches[i % coaches.length],
  createdAt: daysAgo(3 + i),
}));

const findPatient = (id) => patients.find((p) => p._id === id || p.patient_id === id) || patients[0];
const indexOf = (p) => patients.indexOf(p);

// Deterministic pseudo-random so the charts are stable between refetches.
const rand = (a, b) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const series = (pi, key, days, fn) => {
  const out = [];
  for (let d = 0; d < days; d++) {
    if (d > 2 && rand(pi + key, d) < 0.18) continue;
    out.push({ _id: `${key}-${pi}-${d}`, date: daysAgo(d, 15), value: fn(d, rand(pi * 3 + key, d + 1)) });
  }
  return out;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const patientDetails = (p, params) => {
  const pi = indexOf(p);
  const days = Math.min(150, Math.round((Date.now() - new Date(p.createdAt).getTime()) / DAY));
  const improving = (d) => d / Math.max(days, 1);

  const pain_score = series(pi, 1, days, (d, r) => clamp(Math.round(3 + improving(d) * 4 + r * 2), 1, 10));
  const mood_score = series(pi, 2, days, (d, r) => clamp(Math.round(8 - improving(d) * 3 - r * 2), 1, 10));
  const sleep_score = series(pi, 3, days, (d, r) => clamp(Math.round(7.5 - improving(d) * 3 - r * 2), 1, 10));
  const worklife_score = series(pi, 4, days, (d, r) => clamp(Math.round(7 - improving(d) * 2 - r * 2), 1, 10));
  const activity_score = series(pi, 5, days, (d, r) => clamp(Math.round(7 - improving(d) * 3 - r * 2), 1, 10));
  const total_pain_score = series(pi, 6, days, (d, r) => clamp(Math.round(34 + improving(d) * 30 + r * 8), 5, 100));
  const isMigraine = p.product === "Migraine App";
  const migraine_score = isMigraine ? series(pi, 7, days, (d, r) => clamp(Math.round(3 + improving(d) * 4 + r * 2), 1, 10)) : [];
  const migraine_days = isMigraine ? series(pi, 8, days, (d, r) => clamp(Math.round(4 + improving(d) * 3 + r * 2), 0, 10)) : [];

  const loginHistory = [];
  for (let d = 0; d < Math.min(days, 90); d++) {
    if (rand(pi + 11, d) < 0.25) continue;
    loginHistory.push({ _id: `login-${pi}-${d}`, date: daysAgo(d, 16), timeDuration: Math.round(420 + rand(pi + 12, d) * 2100) });
  }

  const taskTitles = {
    Activity: ["Gentle Lumbar Stretch", "Core Stability Basics", "Walking Program - Week 2", "Hip Mobility Flow"],
    Relax: ["Guided Body Scan", "Box Breathing", "Progressive Muscle Relaxation"],
    Learn: ["Understanding Chronic Pain", "Pacing Your Day", "Sleep and Pain", "Flare-Up Planning"],
  };
  const graph_assigned = [];
  for (let d = 0; d < Math.min(days, 75); d++) {
    Object.keys(taskTitles).forEach((category_name, c) => {
      const titles = taskTitles[category_name];
      const r = rand(pi + 20 + c, d);
      graph_assigned.push({
        _id: `task-${pi}-${d}-${c}`,
        category_name,
        title: titles[d % titles.length],
        description: `${category_name} session assigned by ${p.coach.first_name}`,
        video_duration: `${4 + Math.round(r * 9)} mins ${Math.round(r * 50)} sec`,
        date: daysAgo(d, 15),
        assigned_on: daysAgo(d + 1),
        value: r > 0.3,
        isCompletedVideo: r > 0.3,
        watched_at: r > 0.3 ? daysAgo(d, 18) : null,
      });
    });
  }

  const questionnaire_scores = [];
  [["ODI", 46, -5], ["PROMIS Global", 38, 3], ["PHQ-9", 11, -2], ["NDI", 32, -4]].forEach(([questionnaire_name, start, step], q) => {
    for (let k = 0; k < 4; k++) {
      const value = start + step * (3 - k);
      questionnaire_scores.push({
        _id: `q-${pi}-${q}-${k}`,
        questionnaire_name,
        value,
        promis_global_overall: questionnaire_name === "PROMIS Global" ? value : undefined,
        date: daysAgo(k * 30 + 4 + q),
      });
    }
  });

  const reports = [
    ["November Monitoring Summary", "Patient is adherent to the home program 5 of 7 days. Pain trending down, sleep improving. Recommend continuing RTM."],
    ["Mid-Month Check-In", "Reported a mild flare after yard work; resolved within two days using pacing and heat. No medication change."],
    ["October Monitoring Summary", "Completed 82% of assigned activities. Mood scores stable. Discussed walking goal of 20 minutes daily."],
    ["September Monitoring Summary", "Engagement dipped during travel week. Re-established routine, added two relaxation sessions."],
    ["Initial RTM Report", "Baseline established. Patient educated on app use, daily check-ins and flare-up plan."],
  ];
  const coach_to_mdreport = reports.map(([report_name, description], k) => ({
    _id: `report-${pi}-${k}`,
    report_name,
    description,
    created_on: daysAgo(3 + k * 16),
    createdAt: daysAgo(3 + k * 16),
    coach_id: p.coach,
  }));

  const notes = [
    ["Medication review", "Continue current NSAID as needed. Reassess gabapentin dose at next visit if sleep does not improve."],
    ["Imaging follow-up", "MRI reviewed: stable L4-L5 disc bulge, no new nerve compression. No surgical referral needed at this time."],
    ["Activity guidance", "Cleared for low-impact aerobic activity. Avoid heavy lifting over 20 lbs for the next four weeks."],
    ["RTM continuation", "Good response to remote monitoring. Continue RTM for another 30 days and re-evaluate outcomes."],
  ];
  const mdnotes = notes.map(([task_name, description], k) => ({
    _id: `mdnote-${pi}-${k}`,
    task_name,
    description,
    created_on: daysAgo(2 + k * 11),
    createdAt: daysAgo(2 + k * 11),
    provider_id: "mock-user-1",
    patient_id: p._id,
  }));

  const medicine_log_data = [
    [1, ["Ibuprofen 400mg"], "Twice a day", "Flare-up", "Yes"],
    [4, ["Acetaminophen 500mg", "Lidocaine patch"], "Once a day", "Pain after activity", "Somewhat"],
    [9, ["Gabapentin 300mg"], "At bedtime", "Trouble sleeping", "Yes"],
    [15, ["Ibuprofen 400mg"], "As needed", "Flare-up", "No"],
    [23, ["Cyclobenzaprine 5mg"], "At bedtime", "Muscle spasm", "Yes"],
  ].map(([d, flare_up_medicine, Medicine_time, logged, helpful], k) => ({
    _id: `med-${pi}-${k}`,
    log_date: daysAgo(d),
    flare_up_medicine,
    Medicine_time,
    logged,
    helpful,
  }));

  const session_ids = [0, 1].map((b) => ({
    _id: `billing-${pi}-${b}`,
    sessions: [0, 1, 2, 3].map((s) => ({
      _id: `session-${pi}-${b}-${s}`,
      total_time: Math.round(300 + rand(pi + b, s) * 600),
      date: daysAgo(b * 30 + s * 5 + 1),
    })),
  }));

  const mdPage = Number(params.get("mdnotesPage")) || 1;
  const mdLimit = Number(params.get("mdnotesLimit")) || 10;
  const repPage = Number(params.get("coachToMdreportPage") || params.get("coachToMdreport")) || 1;
  const repLimit = Number(params.get("coachToMdreportLimit")) || 10;

  return {
    success: true,
    status: true,
    message: "Patient details fetched successfully",
    patientData: {
      ...p,
      customize_keys: isMigraine
        ? ["Migraine Score", "Migraine Days", "Pain", "Sleep", "Mood", "Work Life"]
        : ["Pain Score", "Pain", "Sleep", "Mood", "Work Life", "Activity"],
      initials: { calculated_initial_pain: 62 + (pi % 5) * 3 },
      migraine_score,
      migraine_days,
      pain_score,
      mood_score,
      sleep_score,
      worklife_score,
      activity_score,
      total_pain_score,
      questionnaire: { questionnaire_scores },
      coach_to_mdreport: coach_to_mdreport.slice((repPage - 1) * repLimit, repPage * repLimit),
      mdnotes: mdnotes.slice((mdPage - 1) * mdLimit, mdPage * mdLimit),
      medicine_log_data,
      session_ids,
      messageCount: 12 + pi * 3,
      loginHistory,
      graph_assigned,
      assignedTask: graph_assigned.slice(0, 10),
      assignedTaskJourney: graph_assigned.slice(0, 10),
    },
    pagination: {
      mdnotes: { totalRecords: mdnotes.length, page: mdPage, limit: mdLimit },
      coachToMdreport: { totalRecords: coach_to_mdreport.length, page: repPage, limit: repLimit },
      assignedTask: { totalRecords: graph_assigned.length },
      assignedTaskJourney: { totalRecords: graph_assigned.length },
    },
  };
};

const patientList = (params) => {
  let rows = [...patients];
  const text = (params.get("searchtext") || params.get("patientName") || "").toLowerCase();
  if (text) rows = rows.filter((p) => `${p.first_name} ${p.last_name} ${p.patient_id}`.toLowerCase().includes(text));
  const pid = (params.get("patientId") || "").toLowerCase();
  if (pid) rows = rows.filter((p) => p.patient_id.toLowerCase().includes(pid));
  const diagnosis = (params.get("diagnosis") || "").toLowerCase();
  if (diagnosis) rows = rows.filter((p) => p.diagnosis.toLowerCase().includes(diagnosis));
  const insurance = (params.get("insurance") || "").toLowerCase();
  if (insurance) rows = rows.filter((p) => p.insurance.toLowerCase().includes(insurance));
  const coachName = (params.get("coachName") || "").toLowerCase();
  if (coachName) rows = rows.filter((p) => p.coach.name.toLowerCase().includes(coachName));

  const sortField = params.get("sortField");
  if (sortField) {
    const dir = params.get("sortDirection") === "desc" ? -1 : 1;
    const val = (p) => String(sortField === "coach" ? p.coach.last_name : p[sortField] ?? "");
    rows.sort((a, b) => val(a).localeCompare(val(b)) * dir);
  }

  const page = Number(params.get("page")) || 1;
  const limit = Number(params.get("limit")) || 10;
  return {
    success: true,
    status: true,
    message: "Patients fetched successfully",
    approved: { data: rows.slice((page - 1) * limit, page * limit), totalRecord: rows.length, page, limit },
    pending: { data: pendingPatients.slice((page - 1) * limit, page * limit), totalRecord: pendingPatients.length, page, limit },
    deleted: { data: [], totalRecord: 0 },
  };
};

const escalationFor = (p, k) => ({
  _id: `esc-${p._id}`,
  escalatedBy: p.coach._id,
  escalatedTo: "mock-user-1",
  comment_to_provider: [
    "Pain score rose 3 points over the past week with reduced activity. Please review before sign-off.",
    "Patient reports new numbness in left foot during walks. Requesting provider guidance.",
    "Missed check-ins for 6 days; reached by phone, reports medication side effects.",
  ][k % 3],
  status: k % 2 === 0 ? "In Review" : "Resolved",
  isAcknowledged: k % 2 === 1,
  acknowledgedBy: k % 2 === 1 ? "mock-user-1" : null,
  acknowledgedByClinic: null,
  providerResponse: k % 2 === 1 ? "Reviewed. Continue current plan and recheck in two weeks." : null,
  createdAt: daysAgo(k + 1, 13),
  resolvedAt: k % 2 === 1 ? daysAgo(k, 17) : null,
});

const signOffList = (params) => {
  const month = params.get("month") || "";
  const decisions = ["Pending", "Continue RTM", "Pending", "Discontinue RTM", "Continue RTM"];
  const comments = {
    "Continue RTM": "Good progress, continue remote monitoring for another month.",
    "Discontinue RTM": "Goals met. Discontinue RTM and follow up in clinic in 8 weeks.",
  };
  const rows = patients.map((p, i) => {
    const decision = decisions[i % decisions.length];
    return {
      _id: p._id,
      patient_id: p.patient_id,
      name: `${p.last_name} ${p.first_name}`,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      diagnosis: p.diagnosis,
      clinic_id: p.clinic_id,
      patientCoach: p.coach,
      patientProvider: p.provider,
      latestPainScore: { value: 28 + ((i * 7) % 40), date: daysAgo(i % 3) },
      painScoreComparison: { trend: i % 3 === 0 ? "up" : "down", percentage: 6 + ((i * 5) % 22) },
      currentMonthProviderDecision: decision,
      signOffRequests: [
        {
          _id: `signoff-${p._id}`,
          month,
          comment_to_coach: comments[decision] || "",
          providerDecision: decision,
          requestedBy: { _id: p.coach._id, name: p.coach.name },
          createdAt: daysAgo(i + 2),
        },
      ],
      latestEscalation: i % 4 === 1 ? escalationFor(p, i) : null,
      latestCoachReport: {
        _id: `report-${i}-0`,
        report_name: "November Monitoring Summary",
        description: `${p.first_name} completed most assigned sessions this month; pain and sleep scores are trending in the right direction.`,
        created_on: daysAgo(i + 3),
      },
    };
  });
  const name = (params.get("provider_name") || "").toLowerCase();
  const filtered = name && !"demo user".includes(name) ? [] : rows;
  const page = Number(params.get("page")) || 1;
  const limit = Number(params.get("limit")) || 10;
  return {
    success: true,
    status: true,
    message: "Sign-off patients fetched successfully",
    data: {
      patients: filtered.slice((page - 1) * limit, page * limit),
      pagination: { totalRecords: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
    },
  };
};

const latestEscalations = () => ({
  success: true,
  data: [patients[1], patients[5], patients[9]].map((p, k) => ({
    _id: p._id,
    patient_id: p.patient_id,
    first_name: p.first_name,
    middle_name: p.middle_name,
    last_name: p.last_name,
    email: p.email,
    clinic_id: p.clinic_id,
    latestEscalation: { ...escalationFor(p, k * 2), status: "In Review", isAcknowledged: false },
  })),
});

const chatNotifications = () => {
  const unreadMessages = [
    [coaches[0], patients[0], "Hi Doctor, James reported a flare-up last night. Could you review his latest pain log?", 0],
    [coaches[1], patients[3], "Linda completed her **ODI** questionnaire, scores improved by 8 points.", 1],
    [coaches[2], patients[6], "Requesting sign-off for Michael's monthly RTM report.", 2],
  ].map(([c, p, text, d], k) => ({
    _id: `chatmsg-${k}`,
    chatId: `chat-${p._id}`,
    patientId: p._id,
    type: "chat",
    text,
    isRead: false,
    timestamp: daysAgo(d, 10 + k),
    sender: { _id: c._id, name: c.name, profile_img: "", userType: "coach" },
    patient: { _id: p._id, name: p.name },
  }));
  return { success: true, unreadMessages, unreadCount: unreadMessages.length };
};

const coachResponseNotifications = () => ({
  success: true,
  data: {
    notifications: [patients[2], patients[7]].map((p, k) => ({
      id: `resp-${k}`,
      type: "provider_response",
      isRead: false,
      patient_id: p._id,
      patient: { _id: p._id, name: p.name },
      providerResponse: k === 0 ? "Continue RTM. Increase walking goal gradually." : "Hold new exercises until follow-up visit.",
      createdAt: daysAgo(k, 12),
    })),
  },
});

const systemNotifications = () => {
  const notifications = [
    ["patient_registered", "New Patient Registered", `${patients[13].name} registered and is awaiting approval.`, patients[13]._id, false, 0],
    ["billing_created", "Bill Created", `A bill for CPT 98977 was created for ${patients[2].name}.`, "billing-2-0", false, 1],
    ["patient_registered", "New Patient Registered", `${patients[12].name} registered and is awaiting approval.`, patients[12]._id, true, 3],
    ["billing_retried", "Bill Retried", `Billing for ${patients[5].name} was retried successfully.`, "billing-5-0", true, 5],
  ].map(([type, title, message, relatedEntityId, isRead, d], k) => ({
    _id: `sysnotif-${k}`,
    type,
    title,
    message,
    relatedEntityId,
    isRead,
    createdAt: daysAgo(d, 11),
  }));
  return { success: true, notifications, unreadCount: notifications.filter((n) => !n.isRead).length, pagination: { totalRecords: notifications.length, page: 1, limit: 20 } };
};

const alertListing = () => ({
  success: true,
  alertData: [
    [coaches[0], patients[0], "James logged pain 8/10 for three consecutive days. Please review."],
    [coaches[1], patients[4], "David has not opened the app in 7 days despite two outreach calls."],
    [coaches[2], patients[8], "Thomas reported increased use of rescue medication this week."],
    [coaches[0], patients[10], "Daniel completed the full 4-week program with 90% adherence."],
    [coaches[1], patients[1], "Maria requests a telehealth visit to discuss sleep medication."],
  ].map(([c, p, message], k) => ({
    _id: `alert-${k}`,
    coach_id: c,
    provider_id: "mock-user-1",
    patient_id: { _id: p._id, first_name: p.first_name, middle_name: p.middle_name, last_name: p.last_name },
    message,
    createdAt: daysAgo(k * 2, 9 + k),
  })),
});

const profile = (id) => {
  const role = mockRole();
  const user = {
    _id: id,
    user_id: "USR-1001",
    first_name: "Demo",
    middle_name: "",
    last_name: "User",
    userName: "Lone Star Pain & Spine",
    md_type: role === "provider" ? "Dr" : "",
    email: "demo@reviveease.com",
    phone: "(512) 555-0100",
    userType: role,
    status: "active",
    profile_img: "",
    clinic_id: "clinic-1",
    clinic_name: "Lone Star Pain & Spine",
    createdAt: daysAgo(400),
  };
  return { success: true, status: true, data: { user } };
};

const handler = (req) => {
  if (req.method !== "GET") return undefined;
  const { path, params } = req;
  let m;

  if (path === "/allpatient" && params.get("providerObjectId")) return patientList(params);

  if (path.startsWith("/provider/patients/watchlistedpatients")) {
    return { success: true, data: patients.filter((p) => p.iswatchlisted) };
  }

  if (path === "/get/getalertlisting" && params.get("provider_id")) return alertListing();

  if ((m = path.match(/^\/getpateintdetails\/([^/]+)$/)) && params.get("actorType") === "provider") {
    return patientDetails(findPatient(m[1]), params);
  }

  if ((m = path.match(/^\/getmdnotes\/([^/]+)$/))) {
    const details = patientDetails(findPatient(m[1]), new URLSearchParams());
    return { success: true, data: details.patientData.mdnotes };
  }

  if ((m = path.match(/^\/patients\/getpatientsignoffescalations\/([^/]+)$/))) {
    const p = findPatient(m[1]);
    const months = ["Nov 2026", "Oct 2026", "Sep 2026"];
    const signOffRequests = months.map((month, k) => ({
      _id: `signoff-${p._id}-${k}`,
      month,
      comment_to_coach: ["Continue current plan, good adherence.", "Add two relaxation sessions per week.", "Baseline reviewed, proceed with RTM."][k],
      providerDecision: "Continue RTM",
      requestedBy: { _id: p.coach._id, name: p.coach.name },
      createdAt: daysAgo(5 + k * 30),
    }));
    return { success: true, data: { signOffRequests, escalations: [escalationFor(p, 1)], pagination: { totalSignoffs: signOffRequests.length, page: 1, limit: 10 } } };
  }

  if ((m = path.match(/^\/coach\/mycoachingnotes\/([^/]+)$/))) {
    const p = findPatient(m[1]);
    const data = [
      ["notes", `${p.first_name} is motivated and responds well to short daily goals.`],
      ["call", "Weekly call: reviewed pacing strategy and sleep routine. Patient agreed to a 10pm wind-down."],
      ["notes", "Prefers morning check-ins. Works night shifts on weekends."],
      ["call", "Discussed flare-up plan; patient will log medication use in the app."],
    ].map(([docType, description], k) => ({ _id: `cnote-${p._id}-${k}`, docType, description, date: daysAgo(2 + k * 6), createdAt: daysAgo(2 + k * 6) }));
    return { success: true, data, totalRecords: data.length };
  }

  if (path === "/patients/signoff-by-provider-or-clinic") return signOffList(params);

  if (path.startsWith("/chat-notifications/")) return chatNotifications();
  if (path === "/patients/escalation-notifications-count") return { success: true, data: { unreadEscalations: 3 } };
  if (path === "/patient/latest-escalations") return latestEscalations();
  if (path === "/patients/provider-response-notifications") return coachResponseNotifications();
  if (path === "/patients/provider-response-notifications-count") return { success: true, data: { unreadResponses: 2 } };
  if (/^\/notifications\/[^/]+\/[^/]+\/unread-count$/.test(path)) return { success: true, unreadCount: systemNotifications().unreadCount };
  if (/^\/notifications\/[^/]+\/[^/]+$/.test(path)) return systemNotifications();

  if ((m = path.match(/^\/getprofile\/([^/]+)$/))) return profile(decodeURIComponent(m[1]));

  return undefined;
};

export default handler;
