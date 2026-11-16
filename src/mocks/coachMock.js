// Mock responses for coach-facing endpoints. Returns undefined for anything not handled here.

const DAY = 86400000;
const NOW = Date.now();
const iso = (daysAgo, hour = 14, minute = 0) => {
  const d = new Date(NOW - daysAgo * DAY);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};
const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
const pad = (n) => String(n).padStart(2, "0");
const monthKey = (monthsAgo) => {
  const d = new Date(NOW);
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const num = (params, key, fallback) => {
  const v = parseInt(params.get(key), 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};
const paginate = (list, page, limit) => list.slice((page - 1) * limit, page * limit);

const COACH = {
  _id: "mock-user-1",
  id: "mock-user-1",
  first_name: "Demo",
  last_name: "User",
  email: "demo@reviveease.com",
  profile_img: "",
};

const PROVIDERS = [
  { _id: "prov-1", first_name: "Olivia", middle_name: "R", last_name: "Bennett", email: "olivia.bennett@lakesideortho.com", profile_img: "" },
  { _id: "prov-2", first_name: "Marcus", middle_name: "", last_name: "Hale", email: "marcus.hale@lakesideortho.com", profile_img: "" },
  { _id: "prov-3", first_name: "Priya", middle_name: "S", last_name: "Raman", email: "priya.raman@northgatepain.com", profile_img: "" },
];

const PATIENT_SEED = [
  ["Sarah", "J", "Mitchell", "Chronic Low Back Pain", "Blue Cross Blue Shield", "Female", "Teacher"],
  ["James", "", "Carter", "Knee Osteoarthritis", "Aetna", "Male", "Electrician"],
  ["Linda", "M", "Nguyen", "Cervical Radiculopathy", "UnitedHealthcare", "Female", "Accountant"],
  ["Robert", "", "Alvarez", "Rotator Cuff Tendinopathy", "Cigna", "Male", "Warehouse Supervisor"],
  ["Emily", "K", "Foster", "Fibromyalgia", "Medicare", "Female", "Retired"],
  ["Daniel", "", "Okafor", "Lumbar Spinal Stenosis", "Humana", "Male", "Bus Driver"],
  ["Grace", "L", "Thompson", "Hip Osteoarthritis", "Medicare", "Female", "Librarian"],
  ["Anthony", "", "Russo", "Sciatica", "Blue Cross Blue Shield", "Male", "Chef"],
  ["Maria", "E", "Santos", "Plantar Fasciitis", "Aetna", "Female", "Nurse"],
  ["William", "T", "Brooks", "Post-Op Total Knee Replacement", "Medicare", "Male", "Retired"],
  ["Hannah", "", "Kim", "Tension Neck Syndrome", "Cigna", "Female", "Software Engineer"],
  ["Charles", "D", "Whitaker", "Degenerative Disc Disease", "UnitedHealthcare", "Male", "Contractor"],
  ["Nora", "", "Patel", "Carpal Tunnel Syndrome", "Humana", "Female", "Dental Hygienist"],
  ["Victor", "A", "Morales", "Ankle Sprain (Chronic)", "Aetna", "Male", "Delivery Driver"],
];

const PATIENTS = PATIENT_SEED.map(([first_name, middle_name, last_name, diagnosis, insurance, gender, occupation], i) => ({
  _id: `pat-${i + 1}`,
  patient_id: `RE-${1042 + i * 7}`,
  title: gender === "Female" ? "Mrs." : "Mr.",
  first_name,
  middle_name,
  last_name,
  email: `${first_name}.${last_name}@mailinator.com`.toLowerCase(),
  cell_number: `(312) 555-01${pad(10 + i)}`,
  address_line_1: `${120 + i * 37} ${pick(["Maple Ave", "Lakeview Dr", "Oak Street", "Cedar Lane"], i)}`,
  city: pick(["Chicago", "Evanston", "Naperville", "Oak Park"], i),
  state: "Illinois",
  zip_code: `606${pad(10 + i)}`,
  date_of_birth: `${1954 + i * 3}-${pad((i % 12) + 1)}-${pad((i * 5) % 27 + 1)}`,
  gender,
  occupation,
  insurance,
  diagnosis,
  status: i === 9 ? "inactive" : "active",
  approval: "approved",
  iswatchlisted: i % 5 === 2,
  profile_img: "",
  createdAt: iso(150 - i * 6, 15),
  created_at: iso(150 - i * 6, 15),
  approved_at: iso(148 - i * 6, 16),
  lastLoginDate: iso(i % 6, 13),
  provider: pick(PROVIDERS, i),
  coach: COACH,
  clinic_id: { _id: "clinic-1", clinic_name: "Lakeside Orthopedic & Pain Center" },
  sessions: { total_time_spend: 1500 + i * 431 },
  session_ids: [{ _id: `sess-${i + 1}` }],
}));

const findPatient = (id) => PATIENTS.find((p) => p._id === id) || PATIENTS[0];

const VIDEOS = {
  Activity: [
    ["Gentle Lumbar Mobility Flow", "A slow sequence of pelvic tilts and knee-to-chest stretches to ease morning stiffness.", "8 mins 30 secs"],
    ["Seated Hip Openers", "Chair-based stretches targeting the hip flexors and piriformis.", "6 mins 15 secs"],
    ["Core Stability Basics", "Dead bugs, bird dogs and bridges for a stronger, more supportive core.", "12 mins 0 secs"],
    ["Neck and Shoulder Release", "Mobility drills to reduce tension from desk work.", "7 mins 45 secs"],
    ["Knee Strengthening Circuit", "Low-impact quad and glute work to support the knee joint.", "10 mins 20 secs"],
    ["Walking Warm-Up Routine", "Dynamic stretches to prepare for a comfortable daily walk.", "5 mins 0 secs"],
  ],
  Relax: [
    ["Body Scan for Pain Relief", "A guided body scan that helps soften areas of tension.", "10 mins 0 secs"],
    ["4-7-8 Breathing Practice", "A calming breath pattern to settle the nervous system.", "4 mins 30 secs"],
    ["Progressive Muscle Relaxation", "Tense and release each muscle group to relieve tightness.", "12 mins 40 secs"],
    ["Evening Wind-Down Meditation", "Prepare your body and mind for restful sleep.", "9 mins 10 secs"],
  ],
  Learn: [
    ["Understanding Chronic Pain", "Why pain persists and how the nervous system can be retrained.", "6 mins 50 secs"],
    ["Pacing Your Activity", "How to stay active without triggering flare-ups.", "5 mins 25 secs"],
    ["Sleep and Pain", "The two-way relationship between sleep quality and pain levels.", "7 mins 5 secs"],
    ["Flare-Up Action Plan", "Practical steps to take when pain spikes.", "4 mins 45 secs"],
  ],
};

const videoList = (category) =>
  (VIDEOS[category] || []).map(([title, description, video_duration], i) => ({
    _id: `vid-${category.toLowerCase()}-${i + 1}`,
    title,
    description,
    video_duration,
    category,
    category_name: category,
    body_part: [pick(["Lower Back", "Neck", "Knee", "Hip", "Shoulder"], i)],
    video_url: `https://videos.example.com/${category.toLowerCase()}/${i + 1}.mp4`,
    thumbnail: "",
    status: "active",
  }));

const ALL_VIDEOS = ["Activity", "Relax", "Learn"].flatMap(videoList);

// One task per day cycling through categories, from 45 days ago to 14 days ahead.
const buildTasks = () => {
  const tasks = [];
  for (let offset = 45; offset >= -14; offset--) {
    const idx = 45 - offset;
    if (idx % 7 === 6) {
      tasks.push({
        _id: `task-${idx}`,
        date: iso(offset, 12),
        assigned_on: iso(Math.max(offset, 0) + 3, 12),
        category_name: "Activity",
        title: "Rest Day",
        description: "Rest Day",
        video_duration: "Rest Day",
        thumbnail: "Rest Day",
        value: false,
        isCompletedVideo: false,
      });
      continue;
    }
    ["Activity", "Relax", "Learn"].forEach((category, c) => {
      if (c === 2 && idx % 2) return;
      const v = pick(videoList(category), idx + c);
      const done = offset > 0 && (idx + c) % 5 !== 3;
      tasks.push({
        _id: `task-${idx}-${c}`,
        date: iso(offset, 12 + c),
        watched_at: done ? iso(offset, 18 + c) : null,
        assigned_on: iso(Math.max(offset, 0) + 3, 12),
        category_name: category,
        category,
        title: v.title,
        description: v.description,
        video_duration: v.video_duration,
        video_url: v.video_url,
        thumbnail: "",
        value: done,
        isCompletedVideo: done,
      });
    });
  }
  return tasks;
};
const TASKS = buildTasks();
const UPCOMING_TASKS = TASKS.filter((t) => new Date(t.date).getTime() >= NOW - DAY).sort((a, b) => new Date(a.date) - new Date(b.date));
const JOURNEY_TASKS = TASKS.filter((t) => new Date(t.date).getTime() < NOW).sort((a, b) => new Date(b.date) - new Date(a.date));

// Newest first: index 0 is the current score, index 1 the previous one.
const scoreSeries = (days, fn) => {
  const out = [];
  for (let d = 0; d <= days; d++) {
    if (d % 9 === 5) continue;
    out.push({ date: iso(d, 15), value: fn(d) });
  }
  return out;
};
const clamp = (v) => Math.max(1, Math.min(10, Math.round(v)));

const QUESTIONNAIRE_SCORES = [
  ["ODI", [22, 30, 38, 46]],
  ["PCS", [14, 19, 25, 31]],
  ["PROMIS Global", [41, 38, 35, 33]],
  ["NDI", [18, 24, 28, 34]],
].flatMap(([questionnaire_name, values]) =>
  values.map((value, i) => ({
    _id: `qs-${questionnaire_name}-${i}`,
    questionnaire_name,
    value,
    promis_global_overall: questionnaire_name === "PROMIS Global" ? value : undefined,
    date: iso(6 + i * 30, 12),
  }))
);

const buildPatientData = (id, seed) => {
  const base = findPatient(id);
  const days = Math.round((NOW - new Date(base.createdAt).getTime()) / DAY);
  const trend = (d, start, end) => end + ((start - end) * d) / Math.max(days, 1);
  return {
    ...base,
    next_appointment_date: iso(-9, 15),
    last_call: { duration: 780 + seed * 45, called_on: iso(3, 16) },
    initials: { calculated_initial_pain: 8 },
    total_pain_score: scoreSeries(days, (d) => clamp(trend(d, 8, 4) + ((d + seed) % 3) - 1)),
    pain_score: scoreSeries(days, (d) => clamp(trend(d, 8, 3) + ((d + seed) % 4) - 1)),
    mood_score: scoreSeries(days, (d) => clamp(trend(d, 4, 8) + ((d + seed) % 3) - 1)),
    sleep_score: scoreSeries(days, (d) => clamp(trend(d, 4, 7) + ((d * 2 + seed) % 3) - 1)),
    loginHistory: Array.from({ length: Math.min(days, 120) + 1 }, (_, d) => d)
      .filter((d) => (d + seed) % 6 !== 4)
      .map((d) => ({ _id: `login-${d}`, date: iso(d, 17), timeDuration: 900 + ((d * 173 + seed * 61) % 2100) })),
    graph_assigned: TASKS,
    assignedTask: UPCOMING_TASKS,
    assignedTaskJourney: JOURNEY_TASKS,
    painFactors: [
      { _id: "pf-1", created_at: iso(1, 19), category: "pain_spike", type: "Sharp", duration: "30 minutes", mood: "Frustrated", influence_by: "Prolonged sitting", pain_intensity: 7, note: "Flared up after a long drive home from work." },
      { _id: "pf-2", created_at: iso(3, 13), category: "factors", type: "Activity", duration: "1 hour", mood: "Calm", influence_by: "Gardening", pain_intensity: 4, note: "Took breaks every 15 minutes and it helped." },
      { _id: "pf-3", created_at: iso(6, 21), category: "factors", type: "Sleep", duration: "5 hours", mood: "Tired", influence_by: "Poor sleep", pain_intensity: 6, note: "Woke up twice during the night." },
      { _id: "pf-4", created_at: iso(10, 16), category: "pain_spike", type: "Throbbing", duration: "2 hours", mood: "Anxious", influence_by: "Lifting groceries", pain_intensity: 8, note: "Used heat pack and rested." },
      { _id: "pf-5", created_at: iso(15, 14), category: "factors", type: "Stress", duration: "All day", mood: "Stressed", influence_by: "Work deadline", pain_intensity: 5, note: "Breathing exercise reduced the tension." },
      { _id: "pf-6", created_at: iso(22, 18), category: "factors", type: "Weather", duration: "Half day", mood: "Low", influence_by: "Cold, damp weather", pain_intensity: 5, note: "" },
    ],
    medicine_log_data: [
      { _id: "ml-1", log_date: iso(1, 12), flare_up_medicine: ["Ibuprofen 400mg"], Medicine_time: "Twice a day", logged: "Flare-up after activity", helpful: "Yes" },
      { _id: "ml-2", log_date: iso(4, 12), flare_up_medicine: ["Acetaminophen 500mg", "Diclofenac Gel"], Medicine_time: "As needed", logged: "Morning stiffness", helpful: "Somewhat" },
      { _id: "ml-3", log_date: iso(8, 12), flare_up_medicine: ["Cyclobenzaprine 5mg"], Medicine_time: "At bedtime", logged: "Muscle spasm", helpful: "Yes" },
      { _id: "ml-4", log_date: iso(13, 12), flare_up_medicine: ["Ibuprofen 400mg"], Medicine_time: "Once a day", logged: "Pain spike", helpful: "No" },
      { _id: "ml-5", log_date: iso(19, 12), flare_up_medicine: ["Naproxen 250mg"], Medicine_time: "Twice a day", logged: "Routine", helpful: "Yes" },
    ],
    medicalInfo: [
      {
        _id: "med-1",
        diseases: [
          {
            diagnosisInfo: [{ diagnosis_name: base.diagnosis }, { diagnosis_name: "Hypertension" }],
            other_medical_cond: "Type 2 Diabetes (diet controlled)",
            med_feel: { feel_range: "Somewhat better", medication_goal: "Reduce reliance on pain medication" },
            medicine_details: [
              { _id: "md-1", medicine_type: "NSAID", medicine_name: "Ibuprofen", dosage: "400mg", duration_medicine_routine: "Twice a day" },
              { _id: "md-2", medicine_type: "Muscle Relaxant", medicine_name: "Cyclobenzaprine", dosage: "5mg", duration_medicine_routine: "At bedtime" },
              { _id: "md-3", medicine_type: "Topical", medicine_name: "Diclofenac Gel", dosage: "1%", duration_medicine_routine: "As needed" },
              { _id: "md-4", medicine_type: "Antihypertensive", medicine_name: "Lisinopril", dosage: "10mg", duration_medicine_routine: "Once a day" },
            ],
          },
        ],
      },
    ],
    painInfo: [
      {
        _id: "pain-1",
        pain_your_goals: ["Walk 30 minutes without pain", "Sleep through the night", "Return to gardening"],
        pain_quality: [
          {
            activity_pain: "Prolonged sitting, bending, lifting",
            activity_affecting_pain: "Heat therapy, gentle stretching, short walks",
            pain_currently: { field_name: ["Physical therapy", "Over-the-counter medication"] },
            pain_details: [
              { pain_location: "Lower Back", pain_levels: "7", pain_duration: "More than 6 months", pain_quality_name: "Aching" },
              { pain_location: "Left Hip", pain_levels: "5", pain_duration: "3-6 months", pain_quality_name: "Sharp" },
              { pain_location: "Left Leg", pain_levels: "4", pain_duration: "1-3 months", pain_quality_name: "Tingling" },
            ],
          },
        ],
      },
    ],
    surgicalInfo: [
      {
        _id: "surg-1",
        comments: "Recovered well, completed 8 weeks of physical therapy.",
        restriction: ["No lifting over 25 lbs", "Avoid high-impact exercise"],
        surgicalDetails: [
          { body_part: "Right Knee", body: "Arthroscopy", duration: "2 years ago" },
          { body_part: "Lower Back", body: "Epidural Steroid Injection", duration: "8 months ago" },
        ],
      },
    ],
    questionnaire: {
      questionnaire_scores: QUESTIONNAIRE_SCORES,
      upcomingOutcomes: [
        { id: "up-1", questionnaire_name: "ODI", note: "Monthly follow-up", requested_date: iso(-7, 12) },
        { id: "up-2", questionnaire_name: "PROMIS Fatigue", note: "Baseline fatigue assessment", requested_date: iso(-14, 12) },
      ],
    },
    coach_to_mdreport: [
      { _id: "rep-1", report_name: "Monthly Progress Summary", description: "Patient is adherent to the activity plan. Pain score trending down from 8 to 4 over the last 3 months.", created_on: iso(5, 15), createdAt: iso(5, 15), docType: "report" },
      { _id: "rep-2", report_name: "Flare-Up Follow-Up", description: "Reported a pain spike after a long drive. Reviewed pacing strategies and flare-up action plan.", created_on: iso(21, 15), createdAt: iso(21, 15), docType: "report" },
      { _id: "rep-3", report_name: "Initial Coaching Assessment", description: "Goals set: walk 30 minutes daily, improve sleep, reduce NSAID use.", created_on: iso(60, 15), createdAt: iso(60, 15), docType: "report" },
    ],
    md_notes: [
      { _id: "mdn-1", description: "Continue current plan. Re-evaluate in 4 weeks.", date: iso(12, 15), createdAt: iso(12, 15) },
      { _id: "mdn-2", description: "Consider reducing NSAID frequency if pain stays below 5.", date: iso(40, 15), createdAt: iso(40, 15) },
    ],
  };
};

const patientDetails = (id, params) => {
  const seed = PATIENTS.findIndex((p) => p._id === id) + 1;
  const data = buildPatientData(id, seed);
  const taskPage = num(params, "assignedTaskPage", 1);
  const taskLimit = num(params, "assignedTaskLimit", 10);
  const journeyPage = num(params, "assignedTaskJourneyPage", 1);
  const journeyLimit = num(params, "assignedTaskJourneyLimit", 10);
  const totalTasks = data.assignedTask.length;
  const totalJourney = data.assignedTaskJourney.length;
  const reports = data.coach_to_mdreport.length;
  return {
    success: true,
    patientData: {
      ...data,
      assignedTask: paginate(data.assignedTask, taskPage, taskLimit),
      assignedTaskJourney: paginate(data.assignedTaskJourney, journeyPage, journeyLimit),
    },
    pagination: {
      assignedTasks: { totalRecords: totalTasks, totalAssignedTaskPages: Math.ceil(totalTasks / taskLimit), currentPage: taskPage },
      assignedTaskJourney: { totalRecords: totalJourney, totalPages: Math.ceil(totalJourney / journeyLimit), currentPage: journeyPage },
      coachToMdreport: { totalRecords: reports, totalPages: 1, currentPage: 1 },
      mdnotes: { totalRecords: data.md_notes.length, totalPages: 1, currentPage: 1 },
    },
  };
};

const sessionsFor = () =>
  Array.from({ length: 14 }, (_, i) => {
    const total_time = 420 + ((i * 197) % 900);
    const call_time = i % 3 === 0 ? 600 + i * 30 : 0;
    const additional_time = i % 4 === 1 ? 300 : 0;
    return {
      _id: `sess-row-${i + 1}`,
      date: iso(2 + i * 4, 15),
      total_time,
      call_time,
      additional_time,
      total_hours: total_time + call_time + additional_time,
      status: "Pending",
    };
  });

const billingList = () => [
  { _id: "bill-1", invoiceNumber: "", status: "Pending", monitoringStartDate: iso(12, 12), total_monitoring_time: 1260, total_calling_time: 600, total_additional_time: 300, cptCodes: [] },
  { _id: "bill-6", invoiceNumber: "", status: "Pending", monitoringStartDate: iso(8, 12), total_monitoring_time: 960, total_calling_time: 420, total_additional_time: 180, cptCodes: [] },
  { _id: "bill-7", invoiceNumber: "", status: "Pending", monitoringStartDate: iso(4, 12), total_monitoring_time: 720, total_calling_time: 300, total_additional_time: 120, cptCodes: [] },
  { _id: "bill-2", invoiceNumber: "INV-2026-1017", status: "Ready to Bill", monitoringStartDate: iso(44, 12), total_monitoring_time: 1980, total_calling_time: 780, total_additional_time: 420, cptCodes: ["98977", "98980"] },
  { _id: "bill-3", invoiceNumber: "INV-2026-0914", status: "Billed", monitoringStartDate: iso(75, 12), total_monitoring_time: 2520, total_calling_time: 1200, total_additional_time: 0, cptCodes: ["98977", "98980", "98981"] },
  { _id: "bill-4", invoiceNumber: "INV-2026-0811", status: "Payment Received", monitoringStartDate: iso(105, 12), total_monitoring_time: 2280, total_calling_time: 900, total_additional_time: 600, cptCodes: ["98975", "98977", "98980"] },
  { _id: "bill-5", invoiceNumber: "INV-2026-0718", status: "Cancelled", monitoringStartDate: iso(135, 12), total_monitoring_time: 840, total_calling_time: 0, total_additional_time: 0, cptCodes: ["98977"], cancellation_remark: "Monitoring time did not meet the 20 minute threshold for this period." },
];

const billingSummary = (id) => {
  const p = findPatient(id);
  return [3, 2, 1].map((m, i) => ({
    _id: `sum-${m}`,
    invoiceNumber: `INV-2026-0${8 + i}1${4 + i}`,
    status: i === 2 ? "Billed" : "Payment Received",
    billing_month: monthKey(m),
    totaloveralltime: 3300 + i * 480,
    totalTimeSpentSeconds: 3300 + i * 480,
    totalmonitoringtime: 2100 + i * 240,
    totalSyncCalls: 2 + i,
    video_duration_minutes: 64 + i * 11,
    loginDaysCount: 18 + i * 2,
    taskDaysUsedFor98977: 16 + i,
    cptCodes: i === 0 ? ["98975", "98977", "98980"] : ["98977", "98980", "98981"],
    cptReport: [
      { code: "98977", units: 1, criteria: "16+ days of data in a 30-day period", description: "Device supply with scheduled recording, musculoskeletal system" },
      { code: "98980", units: 1, criteria: "First 20 minutes of treatment management", description: "RTM treatment management services, first 20 minutes" },
      { code: "98981", units: 1, criteria: "Each additional 20 minutes", description: "RTM treatment management services, each additional 20 minutes" },
      { code: "98985", units: 1, criteria: "2-15 days of data in a 30-day period", description: "Device supply with scheduled recording, 2-15 days" },
    ],
    callDetails: [
      {
        session_id: `cd-${m}-1`,
        session_date: iso(m * 30 - 6, 16),
        call_time: 780,
        call_logs: [{ _id: `cl-${m}-1`, called_on: iso(m * 30 - 6, 16), duration: 780, chart_notes: "Reviewed home exercise adherence and adjusted activity pacing." }],
      },
      { session_id: `cd-${m}-2`, session_date: iso(m * 30 - 18, 16), call_time: 540, call_logs: [] },
    ],
    patient: {
      ...p,
      Email: p.email,
      providerName: `${p.provider.first_name} ${p.provider.last_name}`,
      coach_email_count: [],
      messageCount: 6 + i,
      customize_keys: [],
    },
  }));
};

const callLogs = (params) => {
  const search = (params.get("searchPatient") || "").toLowerCase();
  const notes = [
    ["Reviewed weekly pain trend; patient reports better mornings.", "Prefers calls after 4 PM."],
    ["Discussed flare-up after travel and reinforced pacing plan.", "Daughter helps with the app."],
    ["Walked through new stretching videos and answered questions.", "Motivated, wants more activity videos."],
    ["Medication check-in; patient reduced NSAID use this week.", ""],
    ["Sleep hygiene coaching and evening relaxation routine.", "Follow up on mattress change."],
  ];
  const all = Array.from({ length: 23 }, (_, i) => {
    const p = pick(PATIENTS, i);
    const [chart_notes, personal_notes] = pick(notes, i);
    return {
      _id: `call-${i + 1}`,
      patient_id: p._id,
      patient_custom_id: p.patient_id,
      patient_name: `${p.last_name} ${p.first_name}`,
      called_on: iso(i, 14 + (i % 6), (i * 13) % 60),
      duration: 300 + ((i * 137) % 1200),
      chart_notes,
      personal_notes,
      session_status: pick(["Pending", "Pending", "Ready to Bill", "Billed", "Cancelled"], i),
    };
  }).filter((r) => !search || r.patient_name.toLowerCase().includes(search));
  const page = num(params, "page", 1);
  const limit = num(params, "limit", 10);
  return { success: true, data: paginate(all, page, limit), totalCount: all.length, page, limit };
};

const rtmBillings = (params) => {
  const search = (params.get("searchQuery") || "").toLowerCase();
  const data = PATIENTS.slice(0, 12)
    .map((p, i) => {
      const status = pick(["Ready to Bill", "Pending", "Billed", "Pending"], i);
      const total_monitoring_time = 900 + i * 210;
      const total_calling_time = i % 2 ? 720 : 0;
      const total_additional_time = i % 3 === 0 ? 300 : 0;
      return {
        _id: `rtm-${i + 1}`,
        status,
        patient_id: { _id: p._id, first_name: p.first_name, middle_name: p.middle_name, last_name: p.last_name, patient_id: p.patient_id, profile_img: "" },
        invoiceNumber: status === "Pending" ? "" : `INV-2026-10${pad(i + 1)}`,
        billing_month: monthKey(status === "Pending" ? 0 : 1),
        createdAt: iso(3 + i * 2, 15),
        billed_at: status === "Pending" ? null : iso(1 + i, 15),
        total_monitoring_time,
        total_calling_time,
        total_additional_time,
        overall_total_time_spent: total_monitoring_time + total_calling_time + total_additional_time,
        cptCodes: status === "Pending" ? [] : ["98977", "98980"],
      };
    })
    .filter((b) => !search || `${b.patient_id.first_name} ${b.patient_id.last_name}`.toLowerCase().includes(search));
  const count = (s) => data.filter((b) => b.status === s).length;
  return { success: true, data, count: { readyToBill: count("Ready to Bill"), pending: count("Pending"), billed: count("Billed") }, totalRecords: data.length };
};

const TEMPLATES = [
  ["Low Back Pain - Starter", "Chronic Low Back Pain", 6, 9, 14],
  ["Low Back Pain - Maintenance", "Chronic Low Back Pain", 2, 5, 21],
  ["Knee OA - Strength Builder", "Knee Osteoarthritis", 4, 7, 14],
  ["Neck & Shoulder Relief", "Cervical Radiculopathy", 3, 6, 10],
  ["Post-Op Knee - Phase 1", "Post-Op Total Knee Replacement", 5, 8, 7],
  ["Fibromyalgia - Gentle Movement", "Fibromyalgia", 4, 8, 28],
  ["Hip Mobility Program", "Hip Osteoarthritis", 3, 7, 14],
].map(([template_name, diagnosis, from, to, dayCount], i) => ({
  _id: `tpl-${i + 1}`,
  template_name,
  diagnosis,
  pain_score: { from, to },
  days: Array.from({ length: dayCount }, (_, d) => ({ dayNumber: d + 1 })),
  no_of_days: dayCount,
  created_by: i % 3 === 0 ? "admin" : "coach",
  created_by_name: i % 3 === 0 ? "Revive Admin" : "Demo User",
  createdAt: iso(20 + i * 9, 15),
  status: "active",
}));

const templateDetails = (id) => {
  const tpl = TEMPLATES.find((t) => t._id === id) || TEMPLATES[0];
  const row = (category, d, c) => {
    const v = pick(videoList(category), d + c);
    return { _id: `${tpl._id}-d${d + 1}-${category}`, category, title: v.title, description: v.description, video_duration: v.video_duration, video_url: v.video_url, thumbnail: "" };
  };
  return {
    success: true,
    data: {
      ...tpl,
      days: tpl.days.map(({ dayNumber }, d) => ({
        _id: `${tpl._id}-day-${dayNumber}`,
        dayNumber,
        activities: [row("Activity", d, 0)],
        relaxation: [row("Relax", d, 1)],
        learning: d % 2 === 0 ? [row("Learn", d, 2)] : [],
      })),
    },
  };
};

const resource = (prefix, rows) =>
  rows.map((r, i) => ({
    _id: `${prefix}-${i + 1}`,
    status: i === rows.length - 1 ? "inactive" : "active",
    created_by: pick(["Revive Admin", "Dr. Olivia Bennett", "Clinical Content Team"], i),
    created_on: iso(15 + i * 11, 15),
    createdAt: iso(15 + i * 11, 15),
    thumbnail: "",
    ...r,
  }));

const CHILLS = resource(
  "chill",
  videoList("Relax").map((v) => ({ title: v.title, description: v.description, body_part: v.body_part, video_url: v.video_url, video_duration: v.video_duration }))
);
const ACTIVITIES = resource(
  "activity",
  videoList("Activity").map((v) => ({ title: v.title, description: v.description, body_part: v.body_part, video_url: v.video_url, video_duration: v.video_duration, additional_text: "Stop if pain increases sharply.", quoted_text: "Motion is lotion.", quick_tip: "Breathe out during the effort phase." }))
);
const LEARNS = resource(
  "learn",
  videoList("Learn").map((v) => ({ title: v.title, sub_title: "Pain education series", subtitle: "Pain education series", description: v.description, body_text: v.description, body_part: v.body_part, video_title: v.title, video_url: v.video_url, video_duration: v.video_duration, footer_text: "Talk to your coach if you have questions.", cta_label_text: "Watch now" }))
);
const TIPS = resource("tip", [
  { title: "Change position every 30 minutes", sub_title: "Posture", body_text: "Set a timer and stand, stretch or walk for two minutes to prevent stiffness." },
  { title: "Use heat before activity", sub_title: "Self-care", body_text: "Ten minutes of gentle heat loosens tight muscles before your exercises." },
  { title: "Log your pain at the same time daily", sub_title: "Tracking", body_text: "Consistent logging gives your coach a clearer picture of your progress." },
  { title: "Wind down without screens", sub_title: "Sleep", body_text: "Put devices away 30 minutes before bed and try a short breathing practice." },
  { title: "Break big tasks into small steps", sub_title: "Pacing", body_text: "Spread chores across the day rather than doing them all at once." },
]);
const docs = (prefix, rows) =>
  resource(
    prefix,
    rows.map(([document_name, description, body_text]) => ({
      document_name,
      description,
      body_text,
      file: `/uploads/${prefix}/${document_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
      file_original_name: `${document_name.replace(/[^A-Za-z0-9]+/g, "_")}.pdf`,
    }))
  );
const BILLING_POLICIES = docs("policy", [
  ["RTM CPT Code Reference", "Overview of CPT 98975, 98977, 98980, 98981 and 98985.", "Lists billing thresholds and required documentation for each code."],
  ["Monthly Billing Checklist", "Steps to complete before marking a patient Ready to Bill.", "Verify monitoring days, call logs and provider sign-off."],
  ["Cancellation & Re-billing Policy", "How to handle cancelled invoices.", "Cancelled bills must include a remark and can be re-submitted after edits."],
]);
const RTM_GUIDELINES = docs("guideline", [
  ["RTM Program Overview", "What Remote Therapeutic Monitoring covers.", "Explains eligible conditions, data types and time requirements."],
  ["Patient Onboarding Guide", "Script and steps for the first coaching call.", "Covers consent, app setup and goal setting."],
  ["Escalation Protocol", "When and how to escalate a patient to the provider.", "Red-flag symptoms require same-day escalation."],
  ["Documentation Standards", "Chart note expectations for coaches.", "Use objective language and record time spent accurately."],
]);
const TRAINING_RESOURCES = docs("training", [
  ["Motivational Interviewing Basics", "Core techniques for coaching conversations.", "Open questions, affirmations, reflections and summaries."],
  ["Using the Coach Dashboard", "Walkthrough of patient lists, timers and billing.", "Step-by-step screenshots for each workflow."],
  ["Pain Science for Coaches", "Foundations of modern pain neuroscience.", "Helps coaches explain pain in patient-friendly terms."],
]);

const paged = (rows, params, key = "data") => {
  const page = num(params, "page", 1);
  const limit = num(params, "limit", 10);
  return { success: true, [key]: paginate(rows, page, limit), totalRecords: rows.length, totalPages: Math.ceil(rows.length / limit), currentPage: page };
};

const coachPatients = (params) => {
  const search = (params.get("searchtext") || params.get("patientName") || "").toLowerCase();
  const data = PATIENTS.filter((p) => !search || `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search));
  const empty = { data: [], totalRecords: 0, totalPages: 0, currentPage: 1 };
  return { success: true, approved: { data, totalRecords: data.length, totalPages: 1, currentPage: 1 }, pending: empty, deleted: empty };
};

const alertLog = (params) => {
  const p = findPatient(params.get("patient_id"));
  const messages = [
    "You have a new task assigned for today. Please complete your activity video.",
    "Reminder: please log your pain score for today.",
    "Patient reported a pain spike of 8/10 after lifting. Please review.",
    "Great job completing 5 days in a row! Keep it up.",
    "Your questionnaire is due this week. It takes about 3 minutes.",
    "Monthly coach report is ready for your review.",
  ];
  return {
    success: true,
    alertData: messages.map((message, i) => ({
      _id: `alert-${i + 1}`,
      message,
      status: "Sent",
      patient_id: i % 3 === 2 ? null : { _id: p._id, first_name: p.first_name, last_name: p.last_name },
      provider_id: i % 3 === 2 ? { _id: p.provider._id, first_name: p.provider.first_name, last_name: p.provider.last_name } : null,
      createdAt: iso(i * 4 + 1, 15),
    })),
  };
};

const coachingNotes = (params) => {
  const rows = [
    ["Patient is consistent with morning stretches; sitting tolerance improved to 45 minutes.", "notes"],
    ["Discussed sleep routine. Agreed to try the evening wind-down meditation nightly.", "notes"],
    ["Flare-up after yard work. Reviewed pacing and breaking tasks into smaller blocks.", "notes"],
    ["Monthly progress summary shared with provider.", "report"],
    ["Patient asked about returning to light jogging; will raise with provider.", "notes"],
    ["Initial assessment: goals are walking 30 minutes daily and better sleep.", "notes"],
  ].map(([description, docType], i) => ({ _id: `note-${i + 1}`, description, docType, date: iso(2 + i * 6, 15), createdAt: iso(2 + i * 6, 15) }));
  return paged(rows, params);
};

const signoffEscalations = () => {
  const signOffRequests = [
    ["Continue current plan, patient is progressing well.", "Approved"],
    ["Please increase check-in calls to weekly for the next month.", "Approved with changes"],
    ["Hold activity progression until imaging results are back.", "On hold"],
  ].map(([comment_to_coach, providerDecision], i) => ({
    _id: `signoff-${i + 1}`,
    month: monthKey(i + 1),
    comment_to_coach,
    providerDecision,
    requestedBy: { _id: COACH._id, name: "Demo User" },
    createdAt: iso(8 + i * 30, 15),
  }));
  return { success: true, data: { signOffRequests, pagination: { totalSignoffs: signOffRequests.length, currentPage: 1, totalPages: 1 } } };
};

const profile = (id) => ({
  success: true,
  data: {
    user: {
      ...COACH,
      _id: id,
      id,
      title: "Ms.",
      middle_name: "",
      cell_number: "(312) 555-0199",
      address_line_1: "400 N Michigan Ave",
      city: "Chicago",
      state: "Illinois",
      zip_code: "60611",
      status: "active",
      clinic_id: "clinic-1",
      createdAt: iso(300, 15),
    },
  },
});

const getHandlers = [
  [/^\/allpatient$/, (m, { params }) => (params.get("coachObjectId") ? coachPatients(params) : undefined)],
  [/^\/getpateintdetails\/([^/]+)$/, (m, { params }) => patientDetails(m[1], params)],
  [/^\/get\/getalertlisting$/, (m, { params }) => alertLog(params)],
  [/^\/getcategory\/filters$/, (m, { params }) => ({ success: true, data: params.get("category") ? videoList(params.get("category")) : ALL_VIDEOS })],
  [/^\/api\/getvideodata$/, (m, { params }) => ({ success: true, data: params.get("category") ? videoList(params.get("category")) : ALL_VIDEOS })],
  [/^\/template\/([^/]+)$/, (m) => templateDetails(m[1])],
  [/^\/get-template$/, (m, { params }) => {
    const page = num(params, "page", 1);
    const limit = num(params, "limit", 10);
    return { success: true, data: paginate(TEMPLATES, page, limit), pagination: { totalRecords: TEMPLATES.length, totalPages: Math.ceil(TEMPLATES.length / limit), currentPage: page } };
  }],
  [/^\/getprofile\/([^/]+)$/, (m) => profile(m[1])],
  [/^\/coach\/mycoachingnotes\/([^/]+)$/, (m, { params }) => coachingNotes(params)],
  [/^\/patients\/getpatientsignoffescalations\/([^/]+)$/, () => signoffEscalations()],
  [/^\/billing\/get-billings$/, () => ({ success: true, billingList: billingList() })],
  [/^\/session\/([^/]+)$/, () => {
    const sessions = sessionsFor();
    return { success: true, sessions, total_sessions: sessions.length, patientCptBillable: true };
  }],
  [/^\/billing\/getretry\/([^/]+)(?:\/([^/]+))?$/, () => {
    const sessions = sessionsFor();
    return {
      success: true,
      selectedSessions: sessions.slice(8, 11),
      readyToBillSessions: sessions.slice(11, 14),
      patientCptBillable: true,
      cancelledBill: { billing_comments: "Monitoring time corrected after review of call logs." },
    };
  }],
  [/^\/coach\/get-call-logs\/([^/]+)$/, (m, { params }) => callLogs(params)],
  [/^\/billing\/get-rtmbillings\/([^/]+)$/, (m, { params }) => rtmBillings(params)],
  [/^\/billing\/summary\/([^/]+)$/, (m) => ({ success: true, data: billingSummary(m[1]) })],
  [/^\/billing\/get-cpt-reports\/([^/]+)$/, (m) => ({ success: true, data: billingSummary(m[1]) })],
  [/^\/admin\/activitylist$/, (m, { params }) => paged(ACTIVITIES, params)],
  [/^\/admin\/chilllist$/, (m, { params }) => paged(CHILLS, params, "chills")],
  [/^\/admin\/learnlist$/, (m, { params }) => paged(LEARNS, params)],
  [/^\/admin\/tiplist$/, (m, { params }) => paged(TIPS, params)],
  [/^\/admin\/trainingresourcelist$/, (m, { params }) => paged(TRAINING_RESOURCES, params)],
  [/^\/admin\/rtmguidelineslist$/, (m, { params }) => paged(RTM_GUIDELINES, params)],
  [/^\/admin\/billingpolicylist$/, (m, { params }) => paged(BILLING_POLICIES, params)],
];

const mutationHandlers = [
  [/^\/create-session$/, () => ({ success: true, message: "Session created (mock)", session_id: "sess-mock-1", session: { _id: "sess-mock-1", total_time: 0, status: "Pending" } })],
  [/^\/billing\/(start|pause)-session$/, () => ({ success: true, message: "Session updated (mock)", session: { _id: "sess-mock-1", total_time: 0 } })],
  [/^\/template\/create-template$/, () => ({ success: true, message: "Template created (mock)", template: TEMPLATES[0] })],
];

const handler = (req) => {
  const table = req.method === "GET" ? getHandlers : mutationHandlers;
  for (const [pattern, fn] of table) {
    const match = req.path.match(pattern);
    if (match) return fn(match, req);
  }
  return undefined;
};

export default handler;
