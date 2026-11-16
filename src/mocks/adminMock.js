// TEMP dummy data for admin / sub-admin / clinic-admin pages.
// handler(req) -> response data, or undefined when the endpoint is not owned here.

const NOW = new Date("2026-11-14T15:30:00Z").getTime();
const DAY = 86400000;
const daysAgo = (n, hours = 0) => new Date(NOW - n * DAY - hours * 3600000).toISOString();

const role = () => {
  try {
    return localStorage.getItem("mockRole") || "admin";
  } catch (e) {
    return "admin";
  }
};

const DIAGNOSES = [
  "Chronic Low Back Pain",
  "Fibromyalgia",
  "Knee Osteoarthritis",
  "Cervical Radiculopathy",
  "Rotator Cuff Tendinopathy",
  "Sciatica",
  "Chronic Migraine",
  "Rheumatoid Arthritis",
];
const INSURANCES = [
  "Medicare (Original, Parts A & B)",
  "Medicare Advantage",
  "Blue Cross Blue Shield",
  "Aetna",
  "UnitedHealthcare",
  "Cigna",
];
const CPT_CODES = ["98975", "98977", "98980", "98981"];

const CLINIC_SEED = [
  ["Sunrise Pain & Wellness", "Austin", "TX", "78701", "active"],
  ["Lakeview Orthopedics", "Chicago", "IL", "60614", "active"],
  ["Evergreen Spine Center", "Seattle", "WA", "98101", "active"],
  ["Harborview Physical Medicine", "Boston", "MA", "02110", "active"],
  ["Summit Rehabilitation Clinic", "Denver", "CO", "80202", "active"],
  ["Maple Grove Family Health", "Minneapolis", "MN", "55401", "inactive"],
  ["Cedar Ridge Pain Management", "Nashville", "TN", "37203", "active"],
  ["Riverbend Medical Group", "Portland", "OR", "97205", "active"],
  ["Pacific Coast Wellness", "San Diego", "CA", "92101", "active"],
  ["Heritage Neurology & Pain", "Atlanta", "GA", "30303", "active"],
  ["Bluebird Integrative Care", "Phoenix", "AZ", "85004", "inactive"],
  ["Northstar Orthopedic Institute", "Columbus", "OH", "43215", "active"],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, "");

const clinicsBase = CLINIC_SEED.map(([clinic_name, city, state, zip_code, status], i) => ({
  _id: `clinic_${String(i + 1).padStart(3, "0")}`,
  clinic_id: `CL${1001 + i}`,
  clinic_name,
  city,
  state,
  zip_code,
  status,
  address_line_1: `${120 + i * 37} ${["Main St", "Oak Ave", "Lake Shore Dr", "Pine St", "Market St", "Elm St"][i % 6]}`,
  address_line_2: i % 3 === 0 ? `Suite ${200 + i}` : "",
  country: "US",
  email: `admin@${slug(clinic_name).slice(0, 14)}.com`,
  userName: `${slug(clinic_name).slice(0, 10)}_admin`,
  cell_number: `(${512 + i}) 555-01${String(10 + i)}`,
  web_address: `https://www.${slug(clinic_name).slice(0, 14)}.com`,
  scanClinicLink: `https://app.reviveease.com/register?clinic=CL${1001 + i}`,
  qrCode: "",
  registered_on: daysAgo(400 - i * 29),
  createdAt: daysAgo(400 - i * 29),
}));

const PROVIDER_SEED = [
  ["Emily", "R", "Carter", "MD"], ["Michael", "J", "Nguyen", "DO"], ["Sarah", "L", "Patel", "MD"],
  ["David", "A", "Kim", "MD"], ["Jessica", "M", "Alvarez", "NP"], ["Robert", "T", "Hughes", "MD"],
  ["Priya", "S", "Desai", "MD"], ["Daniel", "K", "O'Brien", "DO"], ["Laura", "E", "Bennett", "PA"],
  ["Anthony", "P", "Russo", "MD"], ["Hannah", "G", "Fischer", "NP"], ["Marcus", "D", "Coleman", "MD"],
  ["Olivia", "C", "Tanaka", "MD"], ["Samuel", "B", "Whitaker", "DO"],
];
const providers = PROVIDER_SEED.map(([first_name, middle_name, last_name, md_type], i) => {
  const c = clinicsBase[i % clinicsBase.length];
  return {
    _id: `prv_${String(i + 1).padStart(3, "0")}`,
    user_id: `PRV${1001 + i}`,
    first_name, middle_name, last_name, md_type,
    title: "Dr",
    name: `${md_type}. ${last_name} ${first_name}`,
    email: `${first_name}.${last_name}`.toLowerCase().replace(/'/g, "") + "@reviveease.com",
    userType: "provider",
    status: i === 9 ? "inactive" : "active",
    clinic_id: c.clinic_id,
    clinicObjectID: c._id,
    clinic_name: c.clinic_name,
    assignedClinicNames: [c.clinic_name],
    cell_number: `(415) 555-02${String(10 + i)}`,
    profile_img: "",
    registered_on: daysAgo(330 - i * 17),
    createdAt: daysAgo(330 - i * 17),
    lastLoginDate: daysAgo(i % 6, i * 3),
  };
});

const COACH_SEED = [
  ["Rachel", "A", "Morgan"], ["Kevin", "L", "Brooks"], ["Natalie", "J", "Reyes"],
  ["Jordan", "M", "Ellis"], ["Megan", "S", "Foster"], ["Tyler", "D", "Chen"],
];
const coaches = COACH_SEED.map(([first_name, middle_name, last_name], i) => ({
  _id: `coach_${String(i + 1).padStart(3, "0")}`,
  user_id: `COA${1001 + i}`,
  first_name, middle_name, last_name,
  name: `${last_name} ${first_name}`,
  email: `${first_name}.${last_name}`.toLowerCase() + "@reviveease.com",
  userType: "coach",
  md_type: "",
  title: "",
  status: i === 5 ? "inactive" : "active",
  clinic_name: "",
  assignedClinicNames: [0, 1, 2].map((k) => clinicsBase[(i * 2 + k) % clinicsBase.length].clinic_name),
  cell_number: `(646) 555-03${String(10 + i)}`,
  profile_img: "",
  registered_on: daysAgo(280 - i * 31),
  createdAt: daysAgo(280 - i * 31),
  lastLoginDate: daysAgo(i % 4, i * 5),
}));

const PATIENT_SEED = [
  ["James", "T", "Anderson", "male"], ["Maria", "E", "Gonzalez", "female"], ["William", "H", "Thompson", "male"],
  ["Linda", "K", "Martinez", "female"], ["Charles", "W", "Robinson", "male"], ["Patricia", "A", "Clark", "female"],
  ["Thomas", "R", "Lewis", "male"], ["Barbara", "J", "Walker", "female"], ["Christopher", "M", "Hall", "male"],
  ["Susan", "L", "Young", "female"], ["Joseph", "P", "King", "male"], ["Karen", "D", "Wright", "female"],
  ["Richard", "S", "Scott", "male"], ["Nancy", "B", "Green", "female"], ["Steven", "C", "Baker", "male"],
  ["Betty", "F", "Adams", "female"], ["Paul", "G", "Nelson", "male"], ["Dorothy", "I", "Mitchell", "female"],
  ["Mark", "N", "Perez", "male"], ["Sandra", "O", "Roberts", "female"], ["George", "V", "Turner", "male"],
  ["Ashley", "Q", "Phillips", "female"], ["Kenneth", "U", "Campbell", "male"], ["Donna", "Y", "Parker", "female"],
  ["Brian", "Z", "Evans", "male"], ["Carol", "X", "Edwards", "female"], ["Edward", "T", "Collins", "male"],
  ["Michelle", "R", "Stewart", "female"], ["Ronald", "E", "Sanchez", "male"], ["Amanda", "W", "Morris", "female"],
  ["Timothy", "A", "Rogers", "male"], ["Melissa", "H", "Reed", "female"], ["Jason", "K", "Cook", "male"],
  ["Deborah", "L", "Morgan", "female"], ["Jeffrey", "M", "Bell", "male"], ["Stephanie", "J", "Murphy", "female"],
  ["Gary", "P", "Bailey", "male"], ["Rebecca", "D", "Rivera", "female"], ["Nicholas", "S", "Cooper", "male"],
  ["Sharon", "B", "Richardson", "female"], ["Eric", "C", "Cox", "male"], ["Cynthia", "F", "Howard", "female"],
  ["Jacob", "G", "Ward", "male"], ["Kathleen", "I", "Torres", "female"],
];
const personRef = (p) => (p ? { _id: p._id, first_name: p.first_name, middle_name: p.middle_name, last_name: p.last_name, md_type: p.md_type || "", email: p.email } : null);

const activeClinics = clinicsBase.filter((c) => c.status === "active");
const patients = PATIENT_SEED.map(([first_name, middle_name, last_name, gender], i) => {
  const clinic = activeClinics[i % activeClinics.length];
  const provider = providers.find((p) => p.clinic_id === clinic.clinic_id) || providers[0];
  const bucket = i < 28 ? "approved" : i < 38 ? "pending" : "deleted";
  const coach = bucket === "pending" && i % 3 === 0 ? null : coaches[i % 5];
  return {
    _id: `pat_${String(i + 1).padStart(3, "0")}`,
    patient_id: `PT${20001 + i}`,
    user_id: `PT${20001 + i}`,
    first_name, middle_name, last_name, gender,
    name: `${last_name} ${middle_name} ${first_name}`,
    title: gender === "male" ? "Mr" : "Ms",
    email: `${first_name}.${last_name}${i}`.toLowerCase() + "@mailinator.com",
    cell_number: `(303) 555-${String(1000 + i * 7)}`,
    date_of_birth: new Date(Date.UTC(1948 + ((i * 7) % 40), (i * 5) % 12, 1 + ((i * 11) % 27))).toISOString(),
    diagnosis: DIAGNOSES[i % DIAGNOSES.length],
    insurance: INSURANCES[i % INSURANCES.length],
    clinic_id: clinic.clinic_id,
    clinicObjectID: clinic._id,
    clinic_name: clinic.clinic_name,
    userType: "patient",
    status: bucket === "approved" ? "active" : bucket === "pending" ? "pending" : "inactive",
    bucket,
    coach: personRef(coach),
    provider: personRef(provider),
    coach_id: coach ? coach._id : null,
    provider_id: provider._id,
    createdAt: daysAgo(3 + i * 6, i),
    registered_on: daysAgo(3 + i * 6, i),
    lastLoginDate: bucket === "approved" ? daysAgo(i % 9, i * 2) : null,
    sessions: { total_time_spend: 600 + ((i * 431) % 5400) },
    pain_score: 2 + (i % 7),
  };
});

const clinics = clinicsBase.map((c) => ({
  ...c,
  number_of_clients: patients.filter((p) => p.clinic_id === c.clinic_id && p.bucket !== "deleted").length,
  number_of_provider: providers.filter((p) => p.clinic_id === c.clinic_id).length,
}));

/* ---------------------------------- helpers --------------------------------- */

const num = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const paginate = (rows, page, limit) => rows.slice((page - 1) * limit, (page - 1) * limit + limit);
const getPath = (obj, path) => String(path).split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const sortRows = (rows, field, order) => {
  if (!field) return rows;
  const dir = String(order).toLowerCase() === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = getPath(a, field);
    const y = getPath(b, field);
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });
};
const has = (text, q) => String(text || "").toLowerCase().includes(String(q || "").toLowerCase().trim());
const fullName = (p) => (p ? `${p.last_name} ${p.middle_name} ${p.first_name}` : "");
const matchesPerson = (p, q) => !q || has(`${p.first_name} ${p.last_name} ${fullName(p)} ${p.email} ${p.user_id || ""} ${p.patient_id || ""}`, q);
const inRange = (iso, from, to) => {
  const t = new Date(iso).getTime();
  if (from && !Number.isNaN(new Date(from).getTime()) && t < new Date(from).getTime()) return false;
  if (to && !Number.isNaN(new Date(to).getTime()) && t > new Date(to).getTime() + DAY) return false;
  return true;
};
const findClinic = (id) => clinics.find((c) => c.clinic_id === id || c._id === id);
const myClinic = clinics[0];

/* ---------------------------------- clinics --------------------------------- */

const clinicList = (q) => {
  let rows = clinics.filter(
    (c) =>
      (!q.get("searchtext") || has(`${c.clinic_name} ${c.clinic_id} ${c.city}`, q.get("searchtext"))) &&
      (!q.get("status") || c.status === q.get("status")) &&
      inRange(c.registered_on, q.get("datefrom"), q.get("dateto"))
  );
  rows = sortRows(rows, q.get("sortBy") || "registered_on", q.get("sortOrder") || "desc");
  const page = num(q.get("page"), 1);
  const limit = num(q.get("limit"), 10);
  return { success: true, status: true, data: paginate(rows, page, limit), totalRecords: rows.length, page, limit };
};

const clinicRecord = (id, q) => {
  const clinic = findClinic(id) || myClinic;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let rows = [
    ...providers.filter((p) => p.clinic_id === clinic.clinic_id),
    ...patients.filter((p) => p.clinic_id === clinic.clinic_id),
  ].map((u) => ({ ...u, userType: cap(u.userType), clinic_name: clinic.clinic_name }));
  const type = (q.get("userType") || "").toLowerCase();
  rows = rows.filter(
    (u) =>
      (!type || u.userType.toLowerCase() === type) &&
      (!q.get("status") || u.status === q.get("status")) &&
      matchesPerson(u, q.get("searchtext")) &&
      inRange(u.createdAt, q.get("datefrom"), q.get("dateto"))
  );
  const page = num(q.get("page"), 1);
  const limit = num(q.get("limit"), 10);
  return {
    success: true,
    status: true,
    data: { ...clinic, clinic_data: paginate(rows, page, limit) },
    totalRecords: rows.length,
    page,
    limit,
  };
};

/* ----------------------------------- users ---------------------------------- */

const userList = (q) => {
  let rows = [...coaches, ...providers].filter(
    (u) =>
      matchesPerson(u, q.get("searchtext")) &&
      (!q.get("status") || u.status === q.get("status")) &&
      (!q.get("userType") || u.userType === q.get("userType")) &&
      inRange(u.registered_on, q.get("datefrom"), q.get("dateto"))
  );
  rows = sortRows(rows, q.get("sortBy") || "registered_on", q.get("sortOrder") || "desc");
  const page = num(q.get("page"), 1);
  const limit = num(q.get("limit"), 10);
  return {
    success: true,
    status: true,
    data: paginate(rows, page, limit),
    pagination: { totalRecords: rows.length, currentPage: page, limit, totalPages: Math.ceil(rows.length / limit) },
  };
};

const providerList = (id) => {
  const clinic = id ? findClinic(id) : null;
  const rows = clinic ? providers.filter((p) => p.clinic_id === clinic.clinic_id) : providers;
  return { success: true, status: true, data: rows.length ? rows : providers.slice(0, 3) };
};

/* --------------------------------- patients --------------------------------- */

const patientList = (q) => {
  const r = role();
  const filtered = patients.filter((p) => {
    if (r === "clinic admin" && !q.get("clinic_id") && p.clinic_id !== myClinic.clinic_id) return false;
    if (q.get("clinic_id") && p.clinic_id !== q.get("clinic_id") && p.clinicObjectID !== q.get("clinic_id")) return false;
    if (q.get("searchtext") && !matchesPerson(p, q.get("searchtext"))) return false;
    if (q.get("patientId") && !has(p.patient_id, q.get("patientId"))) return false;
    if (q.get("patientName") && !matchesPerson(p, q.get("patientName"))) return false;
    if (q.get("coachName") && !has(fullName(p.coach), q.get("coachName"))) return false;
    if (q.get("providerName") && !has(fullName(p.provider), q.get("providerName"))) return false;
    if (q.get("diagnosis") && !has(p.diagnosis, q.get("diagnosis"))) return false;
    if (q.get("insurance") && p.insurance !== q.get("insurance")) return false;
    if (q.get("coachAssigned") === "false" && p.coach) return false;
    if (q.get("coachObjectId") && r === "coach" && p.coach?._id !== coaches[0]._id) return false;
    if (q.get("providerObjectId") && r === "provider" && p.provider?._id !== providers[0]._id) return false;
    return inRange(p.createdAt, q.get("registerDateFrom"), q.get("registerDateTo"));
  });
  const sorted = sortRows(filtered, q.get("sortField"), q.get("sortDirection"));
  const section = (bucket, pageKey, limitKey) => {
    const rows = sorted.filter((p) => p.bucket === bucket);
    const page = num(q.get(pageKey), 1);
    const limit = num(q.get(limitKey), 10);
    return {
      data: paginate(rows, page, limit),
      totalRecord: rows.length,
      totalRecords: rows.length,
      currentPage: page,
      limit,
    };
  };
  return {
    success: true,
    status: true,
    approved: section("approved", "page", "limit"),
    pending: section("pending", "pendingPage", "pendingLimit"),
    deleted: section("deleted", "deletedPage", "deletedLimit"),
  };
};

const DECISIONS = ["Pending Review", "Continue RTM", "Discontinue RTM", "Continue RTM", "Pending Review"];
const COACH_SUMMARIES = [
  "Patient completed 18 of 21 assigned sessions this month; reports improved sleep and reduced morning stiffness.",
  "Engagement dipped mid-month after a flare-up. Resumed relaxation videos and daily stretching in the last week.",
  "Consistent logins and pain diary entries. Pain trending down, requests progression of activity plan.",
  "Missed two check-in calls. Pain unchanged; recommend provider review of medication adherence.",
  "Strong adherence to home exercise program. Patient feels confident managing symptoms independently.",
];
const signOffList = (q) => {
  let rows = patients.filter((p) => p.bucket === "approved");
  if (role() === "clinic admin") rows = rows.filter((p, i) => p.clinic_id === myClinic.clinic_id || i % 3 === 0);
  if (q.get("provider_name")) {
    const byProvider = rows.filter((p) => has(fullName(p.provider), q.get("provider_name")) || has(`${p.provider.first_name} ${p.provider.last_name}`, q.get("provider_name")));
    rows = byProvider.length ? byProvider : rows.slice(0, 4);
  }
  const mapped = rows.map((p, i) => {
    const escalated = i % 4 === 1;
    return {
      _id: p._id,
      patient_id: p.patient_id,
      name: fullName(p),
      first_name: p.first_name,
      middle_name: p.middle_name,
      last_name: p.last_name,
      email: p.email,
      diagnosis: p.diagnosis,
      clinic_id: p.clinic_id,
      latestPainScore: { value: p.pain_score, date: daysAgo(i % 5) },
      painScoreComparison: { trend: i % 3 === 0 ? "up" : "down", percentage: 5 + ((i * 7) % 35) },
      currentMonthProviderDecision: DECISIONS[i % DECISIONS.length],
      signOffRequests: [
        {
          _id: `sor_${p._id}`,
          comment_to_coach: i % 5 === 0 ? "" : ["Continue current plan.", "Increase activity level gradually.", "Please schedule a follow-up call next week.", "Monitor pain scores closely."][i % 4],
          status: i % 2 ? "pending" : "approved",
          createdAt: daysAgo(1 + (i % 12)),
        },
      ],
      latestEscalation: escalated
        ? {
            _id: `esc_${p._id}`,
            status: i % 8 === 1 ? "In Review" : "Resolved",
            comment_to_provider: "Pain score increased by 3 points over the last week; patient reports new numbness in left leg.",
            createdAt: daysAgo(i % 6),
          }
        : null,
      latestCoachReport: { _id: `rep_${p._id}`, description: COACH_SUMMARIES[i % COACH_SUMMARIES.length], createdAt: daysAgo(2 + (i % 10)) },
      patientCoach: p.coach || personRef(coaches[0]),
      patientProvider: p.provider,
    };
  });
  const page = num(q.get("page"), 1);
  const limit = num(q.get("limit"), 10);
  return {
    success: true,
    status: true,
    data: {
      patients: paginate(mapped, page, limit),
      pagination: { totalRecords: mapped.length, currentPage: page, limit, totalPages: Math.ceil(mapped.length / limit) },
    },
  };
};

/* -------------------------------- audit logs -------------------------------- */

const AUDIT_ACTORS = [
  { actorType: "admin", actorId: { _id: "mock-user-1", first_name: "Demo", middle_name: "", last_name: "User", clinic_name: "" } },
  { actorType: "sub admin", actorId: { _id: "sub_001", first_name: "Alicia", middle_name: "M", last_name: "Grant", clinic_name: "" } },
  { actorType: "coach", actorId: { ...personRef(coaches[0]), clinic_name: "" } },
  { actorType: "provider", actorId: { ...personRef(providers[0]), clinic_name: "" } },
  { actorType: "clinic admin", actorId: { _id: myClinic._id, first_name: "", middle_name: "", last_name: "", clinic_name: myClinic.clinic_name } },
];
const AUDIT_ACTIONS = ["create", "update", "view", "delete", "update", "view"];
const auditLogsAll = Array.from({ length: 64 }, (_, i) => {
  const actor = AUDIT_ACTORS[i % AUDIT_ACTORS.length];
  const p = patients[i % patients.length];
  const kinds = [
    { targetType: "Clinic", module: "Clinic", details: { after: { clinic_name: clinics[i % clinics.length].clinic_name } } },
    { targetType: "Users", module: "User", details: { after: { first_name: providers[i % providers.length].first_name, last_name: providers[i % providers.length].last_name } } },
    { targetType: "Patient", module: "Patient", details: { after: { first_name: p.first_name, last_name: p.last_name } } },
    { targetType: "Billing", module: "Billing", details: { after: { invoiceNumber: `INV-2026-${String(1040 + i)}` } } },
    { targetType: "Journey Template", module: "Journey Template", details: { after: { template_name: `${DIAGNOSES[i % DIAGNOSES.length]} - 4 Week Plan` } } },
    { targetType: "Content Management", module: "Learn", details: { after: { title: ["Understanding Chronic Pain", "Box Breathing Basics", "Daily Stretch Routine"][i % 3] } } },
    { targetType: "Report & Analytics", module: "Report & Analytics", details: {} },
  ];
  return {
    _id: `audit_${String(i + 1).padStart(3, "0")}`,
    ...actor,
    ...kinds[i % kinds.length],
    action: AUDIT_ACTIONS[i % AUDIT_ACTIONS.length],
    targetId: p._id,
    timestamp: new Date(NOW - i * 5.3 * 3600000).toISOString(),
  };
});
const filterAudit = (q) => {
  const actions = q.getAll("action").map((a) => a.toLowerCase());
  const targets = q.getAll("targetType");
  let rows = auditLogsAll.filter(
    (l) =>
      (!actions.length || actions.includes(l.action)) &&
      (!targets.length || targets.includes(l.targetType)) &&
      (!q.get("module") || l.module === q.get("module")) &&
      inRange(l.timestamp, q.get("startDate"), q.get("endDate"))
  );
  const field = q.get("sortField");
  if (field) {
    const key = field === "actorId" ? "actorId.last_name" : field;
    rows = sortRows(rows, key, q.get("sortOrder"));
  }
  return rows;
};
const auditLogs = (q) => {
  const rows = filterAudit(q);
  const page = num(q.get("page"), 1);
  const limit = num(q.get("limit"), 10);
  return { success: true, status: true, data: paginate(rows, page, limit), total: rows.length, totalRecords: rows.length, page, limit };
};
const auditCsv = (q) => {
  const lines = filterAudit(q).map((l) =>
    [`${l.actorId.last_name} ${l.actorId.first_name}${l.actorId.clinic_name}`.trim(), l.actorType, l.targetType, l.module, l.action, l.timestamp].map((v) => `"${v}"`).join(",")
  );
  return new Blob([["User Name,User Role,Module,Record,Action,Event Date", ...lines].join("\n")], { type: "text/csv" });
};

/* ----------------------------- reports & analytics ---------------------------- */

const reportAnalytics = (q) => {
  let pool = patients.filter((p) => p.bucket === "approved");
  if (q.get("clinic_id")) pool = pool.filter((p) => p.clinic_id === q.get("clinic_id") || p.clinicObjectID === q.get("clinic_id"));
  if (q.get("diagnosis")) pool = pool.filter((p) => p.diagnosis === q.get("diagnosis"));
  if (q.get("coachName")) pool = pool.filter((p) => has(fullName(p.coach), q.get("coachName")) || has(`${p.coach?.first_name} ${p.coach?.last_name}`, q.get("coachName")));
  const clinicRows = clinics
    .map((c) => {
      const prov = providers.find((p) => p.clinic_id === c.clinic_id);
      return {
        _id: c._id,
        clinic_id: c.clinic_id,
        clinic_name: c.clinic_name,
        provider: { _id: prov?._id, name: prov ? `${prov.md_type}. ${prov.last_name} ${prov.first_name}` : "No Provider Assigned" },
        patient_count: pool.filter((p) => p.clinic_id === c.clinic_id).length,
      };
    })
    .filter((r) => r.patient_count > 0 || !q.get("clinic_id"));
  const coachRows = coaches
    .map((c) => ({ _id: c._id, coach_name: `${c.last_name} ${c.middle_name} ${c.first_name}`, patient_count: pool.filter((p) => p.coach?._id === c._id).length }))
    .filter((r) => r.patient_count > 0 || !q.get("coachName"));
  const cp = num(q.get("clinicPage"), 1);
  const cl = num(q.get("clinicLimit"), 10);
  const hp = num(q.get("coachPage"), 1);
  const hl = num(q.get("coachLimit"), 10);
  return {
    success: true,
    status: true,
    data: {
      total_patients: pool.length,
      clinic_provider_patients: paginate(clinicRows, cp, cl),
      coach_patients: paginate(coachRows, hp, hl),
      pagination: {
        clinic: { totalRecords: clinicRows.length, currentPage: cp, limit: cl },
        coach: { totalRecords: coachRows.length, currentPage: hp, limit: hl },
      },
    },
  };
};

const cptSummary = () => ({
  success: true,
  status: true,
  data: [
    { cptCode: "98975", counts: [{ status: "Pending", count: 6 }, { status: "Billed", count: 31 }] },
    { cptCode: "98977", counts: [{ status: "Pending", count: 9 }, { status: "Billed", count: 24 }] },
    { cptCode: "98980", counts: [{ status: "Pending", count: 4 }, { status: "Payment Received", count: 19 }] },
    { cptCode: "98981", counts: [{ status: "Pending", count: 2 }, { status: "Billed", count: 11 }] },
  ],
  topWatchedVideos: [
    { _id: "vid_1", title: "4-7-8 Calming Breath", watchCount: 312 },
    { _id: "vid_2", title: "Gentle Morning Stretch", watchCount: 268 },
    { _id: "vid_3", title: "Understanding Chronic Pain", watchCount: 204 },
    { _id: "vid_4", title: "Lower Back Mobility Flow", watchCount: 177 },
    { _id: "vid_5", title: "Progressive Muscle Relaxation", watchCount: 149 },
    { _id: "vid_6", title: "Pacing Your Activity", watchCount: 96 },
  ],
  callStatistics: { totalCalls: 142, totalCallTime: 86400, averageCallTime: 608 },
  patientEngagement: {
    totalLogins: 1284,
    totalVideoWatchDuration: 412380,
    totalVideosWatched: 2156,
    averageVideosWatchedPerWatchingPatient: 17.4,
  },
});

/* ---------------------------------- billing --------------------------------- */

const BILL_STATUSES = ["Pending", "Billed", "Payment Received", "Pending", "Cancelled", "Billed"];
const billingRecords = Array.from({ length: 34 }, (_, i) => {
  const p = patients[i % 28];
  const status = BILL_STATUSES[i % BILL_STATUSES.length];
  const created = 2 + i * 3;
  return {
    _id: `bill_${String(i + 1).padStart(3, "0")}`,
    invoiceNumber: `INV-2026-${String(1101 + i)}`,
    patient_id: p._id,
    patient_name: `${p.last_name} ${p.middle_name} ${p.first_name}`,
    patient_code: p.patient_id,
    clinic_id: p.clinic_id,
    clinic_name: p.clinic_name,
    insurance: p.insurance,
    cptCodes: [CPT_CODES[i % 4], CPT_CODES[(i + 1) % 4], ...(i % 3 === 0 ? [CPT_CODES[(i + 1) % 4]] : [])],
    status,
    billing_comments: i % 2 ? "Monthly RTM billing" : "",
    createdAt: daysAgo(created),
    billed_at: status === "Billed" || status === "Payment Received" ? daysAgo(Math.max(created - 1, 0)) : null,
    cancelled_at: status === "Cancelled" ? daysAgo(Math.max(created - 1, 0)) : null,
    cancellation_remark: status === "Cancelled" ? "Insufficient data transmission days" : "",
    payment_received_date: status === "Payment Received" ? daysAgo(Math.max(created - 2, 0)) : null,
    payment_comments: status === "Payment Received" ? "Paid in full via EFT" : "",
  };
});

const billingStatus = (clinicId, q) => {
  let rows = billingRecords;
  const clinic = findClinic(clinicId);
  if (clinic) {
    const scoped = rows.filter((b) => b.clinic_id === clinic.clinic_id);
    rows = scoped.length >= 3 ? scoped : rows.slice(0, 14);
  }
  if (q.get("status")) rows = rows.filter((b) => b.status === q.get("status"));
  const month = q.get("billingMonth");
  if (month) {
    const d = new Date(month);
    if (!Number.isNaN(d.getTime())) {
      const scoped = rows.filter((b) => {
        const c = new Date(b.createdAt);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      });
      rows = scoped;
    }
  }
  const page = num(q.get("billingPage"), 1);
  const limit = num(q.get("billingLimit"), 10);
  return { success: true, status: true, billingRecords: paginate(rows, page, limit), totalBilling: rows.length, page, limit };
};

const billDetail = (patientId, billingId) => {
  const bill = billingRecords.find((b) => b._id === billingId) || billingRecords[1];
  const p = patients.find((x) => x._id === patientId) || patients[0];
  const seed = parseInt(String(bill._id).replace(/\D/g, ""), 10) || 1;
  const sessions = Array.from({ length: 9 }, (_, i) => ({
    _id: `sess_${bill._id}_${i}`,
    date: daysAgo(3 + i * 3 + (seed % 4)),
    total_time: 420 + ((seed * 53 + i * 197) % 900),
    call_time: i % 3 === 0 ? 300 + ((seed * 31 + i * 71) % 600) : 0,
    additional_time: i % 2 ? 120 + ((seed * 17 + i * 43) % 300) : 0,
  }));
  return {
    success: true,
    status: true,
    data: {
      sessions,
      count: sessions.length,
      patient: { _id: p._id, first_name: p.first_name, last_name: p.last_name, name: fullName(p), is98975Assigned: true },
      billing: {
        _id: bill._id,
        invoiceNumber: bill.invoiceNumber,
        status: bill.status,
        cptCodes: bill.cptCodes,
        billing_comments: bill.billing_comments || "Monthly RTM billing",
        payment_received_date: bill.payment_received_date,
        payment_comments: bill.payment_comments,
        dataTransmissionLoginDays: 18,
      },
    },
  };
};

/* ------------------------------ journey templates ----------------------------- */

const VIDEO_LIBRARY = {
  Activity: [
    ["Gentle Morning Stretch", "A 10 minute full-body stretch to ease stiffness after waking.", "10:12"],
    ["Lower Back Mobility Flow", "Slow controlled movements to restore lumbar mobility.", "12:40"],
    ["Seated Core Activation", "Chair based core work suitable for flare-up days.", "08:05"],
    ["Walking Warm-Up", "Prepare hips and ankles before your daily walk.", "06:30"],
  ],
  Relax: [
    ["4-7-8 Calming Breath", "Guided breathing pattern to settle the nervous system.", "05:20"],
    ["Progressive Muscle Relaxation", "Tense and release each muscle group from toes to head.", "14:00"],
    ["Body Scan for Pain Relief", "Mindful attention through the body to soften guarding.", "11:45"],
  ],
  Learn: [
    ["Understanding Chronic Pain", "How the nervous system amplifies pain signals over time.", "07:55"],
    ["Pacing Your Activity", "Avoid the boom-and-bust cycle with planned pacing.", "06:10"],
    ["Sleep and Pain", "Practical sleep habits that reduce next-day pain.", "09:25"],
  ],
};
const videosFor = (category) =>
  (VIDEO_LIBRARY[category] || []).map(([title, description, video_duration], i) => ({
    _id: `${category.toLowerCase()}_vid_${i + 1}`,
    title,
    description,
    video_duration,
    category,
    status: "active",
    video_url: `uploads/videos/${category.toLowerCase()}_${i + 1}.mp4`,
    thumbnail: "",
    body_part: ["Back", "Neck"],
    created_by: "Demo User",
    createdAt: daysAgo(40 + i * 9),
  }));

const templateDays = (n) =>
  Array.from({ length: n }, (_, d) => {
    const pick = (category, type, k) => {
      const v = videosFor(category)[(d + k) % videosFor(category).length];
      return { ...v, _id: `row_${type}_${d + 1}_${k}`, category };
    };
    return {
      _id: `day_${d + 1}`,
      dayNumber: d + 1,
      activities: [pick("Activity", "act", 0)],
      relaxation: [pick("Relax", "rel", 0)],
      learning: d % 2 === 0 ? [pick("Learn", "lrn", 0)] : [],
    };
  });

const templates = Array.from({ length: 14 }, (_, i) => {
  const from = (i % 4) * 2 + 1;
  const author = i % 3 === 0 ? coaches[i % coaches.length] : null;
  return {
    _id: `tpl_${String(i + 1).padStart(3, "0")}`,
    template_name: `${DIAGNOSES[i % DIAGNOSES.length]} - ${[2, 4, 6][i % 3]} Week Plan`,
    diagnosis: DIAGNOSES[i % DIAGNOSES.length],
    pain_score: { from, to: Math.min(from + 3, 10) },
    days: templateDays([14, 28, 42][i % 3] / 2),
    date_range: { start_date: daysAgo(30), end_date: daysAgo(-30) },
    created_by: author ? "Coach" : "Admin",
    created_by_name: author ? `${author.first_name} ${author.last_name}` : "Demo User",
    status: "active",
    createdAt: daysAgo(10 + i * 8),
  };
});

/* -------------------------------- notifications ------------------------------- */

const systemNotifications = [
  ["patient_registered", "New Patient Registered", `${fullName(patients[30])} registered at ${patients[30].clinic_name} and is awaiting approval.`, patients[30]._id, false, 0.2],
  ["billing_created", "Bill Created", `Invoice ${billingRecords[0].invoiceNumber} was created for ${billingRecords[0].patient_name}.`, billingRecords[0]._id, false, 0.6],
  ["patient_registered", "New Patient Registered", `${fullName(patients[31])} registered at ${patients[31].clinic_name} and is awaiting approval.`, patients[31]._id, false, 1.1],
  ["billing_retried", "Bill Retried", `Invoice ${billingRecords[4].invoiceNumber} was resubmitted by coach ${coaches[1].first_name} ${coaches[1].last_name}.`, billingRecords[4]._id, true, 2.3],
  ["clinic_created", "Clinic Added", `${clinics[11].clinic_name} was added to Revive Ease.`, clinics[11]._id, true, 4],
  ["billing_cancelled", "Bill Cancelled", `Invoice ${billingRecords[10].invoiceNumber} was cancelled.`, billingRecords[10]._id, true, 6.5],
].map(([type, title, message, relatedEntityId, isRead, age], i) => ({
  _id: `sys_notif_${i + 1}`,
  type,
  title,
  message,
  relatedEntityId,
  patientId: type === "patient_registered" ? relatedEntityId : billingRecords[i % billingRecords.length].patient_id,
  isRead,
  createdAt: new Date(NOW - age * DAY).toISOString(),
}));

const latestEscalations = [patients[1], patients[5], patients[9]].map((p, i) => ({
  _id: p._id,
  first_name: p.first_name,
  middle_name: p.middle_name,
  last_name: p.last_name,
  email: p.email,
  clinic_id: p.clinic_id,
  patient_id: p.patient_id,
  latestEscalation: {
    _id: `esc_${p._id}`,
    escalatedBy: p.coach?._id || coaches[0]._id,
    escalatedTo: p.provider?._id,
    comment_to_provider: ["Pain score rose from 4 to 7 this week; patient requests medication review.", "Patient reports new tingling in right hand during exercises.", "Missed three consecutive sessions and is not answering calls."][i],
    status: i === 2 ? "Resolved" : "In Review",
    isAcknowledged: i === 2,
    acknowledgedBy: i === 2 ? p.provider?._id : null,
    acknowledgedByClinic: null,
    createdAt: daysAgo(i, i * 4 + 1),
    resolvedAt: i === 2 ? daysAgo(1) : null,
    providerResponse: i === 2 ? "Reached patient by phone; continue RTM." : "",
  },
}));

const providerResponses = [patients[2], patients[7]].map((p, i) => ({
  id: `resp_${i + 1}`,
  _id: `resp_${i + 1}`,
  type: "provider_response",
  isRead: false,
  patient: { _id: p._id, name: fullName(p) },
  patient_id: p._id,
  providerResponse: ["Continue RTM, increase activity plan next month.", "Please schedule a tele-visit to review medication."][i],
  createdAt: daysAgo(i, 3 + i * 6),
}));

const chatNotifications = () => {
  const r = role();
  if (r !== "coach" && r !== "provider") return { success: true, unreadMessages: [], unreadCount: 0 };
  const other = r === "coach" ? providers[0] : coaches[0];
  const unreadMessages = [
    {
      _id: "chat_msg_1",
      chatId: "chat_001",
      type: "chat",
      isRead: false,
      text: `Quick update on **${patients[3].first_name} ${patients[3].last_name}** - pain diary looks much better this week.`,
      sender: { _id: other._id, name: `${other.first_name} ${other.last_name}`, profile_img: "" },
      patientId: patients[3]._id,
      timestamp: daysAgo(0, 2),
    },
  ];
  if (r === "coach") {
    unreadMessages.push({
      _id: billingRecords[4]._id,
      id: billingRecords[4]._id,
      type: "billing_cancelled",
      isRead: false,
      text: `Invoice ${billingRecords[4].invoiceNumber} has been cancelled`,
      patientId: billingRecords[4].patient_id,
      billingData: {
        billingId: billingRecords[4]._id,
        cancellation_remark: billingRecords[4].cancellation_remark,
        patient: { _id: billingRecords[4].patient_id, name: billingRecords[4].patient_name },
      },
      timestamp: daysAgo(1, 5),
    });
  }
  return { success: true, unreadMessages, unreadCount: 1 };
};

/* ---------------------------------- profile --------------------------------- */

const profile = (id) => {
  const r = role();
  const known = [...providers, ...coaches].find((u) => u._id === id);
  const base = known
    ? { ...known }
    : {
        _id: id || "mock-user-1",
        first_name: "Demo",
        middle_name: "",
        last_name: "User",
        title: r === "provider" ? "Dr" : "",
        md_type: r === "provider" ? "MD" : "",
        email: "demo@reviveease.com",
        userName: r === "clinic admin" ? myClinic.clinic_name : "demo.user",
        userType: r,
        status: "active",
        profile_img: "",
        cell_number: "(512) 555-0100",
        alert: true,
        notification: true,
      };
  if (!known && (r === "clinic admin" || r === "provider")) {
    base.clinic_id = myClinic.clinic_id;
    base.clinicObjectID = myClinic._id;
    base.clinic_name = myClinic.clinic_name;
  }
  return { success: true, status: true, data: { user: base } };
};

/* ---------------------------------- dispatch --------------------------------- */

const handler = (req) => {
  if (req.method !== "GET") return undefined;
  const path = req.path;
  const q = req.params || new URLSearchParams();
  const seg = path.split("/").filter(Boolean);
  let m;

  if (path === "/getcliniclist") return clinicList(q);
  if ((m = path.match(/^\/clinicrecord\/([^/]+)$/))) return clinicRecord(decodeURIComponent(m[1]), q);
  if ((m = path.match(/^\/downloadQRCode\/([^/]+)$/))) return { success: true, data: { qrCode: "" } };

  if (path === "/coachproviderlisting") return userList(q);
  if (path === "/coach/coachlisting") return { success: true, status: true, data: coaches.filter((c) => c.status === "active") };
  if (seg[0] === "providerlisting") return providerList(seg[1] && seg[1] !== "undefined" && seg[1] !== "null" ? decodeURIComponent(seg[1]) : null);

  if (path === "/allpatient") return patientList(q);
  if (path === "/patients/signoff-by-provider-or-clinic") return signOffList(q);
  if (path === "/logs/audit-logs") return auditLogs(q);
  if (path === "/audit-logs/export/csv") return auditCsv(q);
  if (seg[0] === "provider" && seg[1] === "patients" && seg[2] === "watchlistedpatients") {
    return { success: true, status: true, data: patients.filter((p, i) => p.bucket === "approved" && i % 4 === 0) };
  }

  if (path === "/patients/reportnanalytics") return reportAnalytics(q);
  if (path === "/billing/cpt-code-summary") return cptSummary();

  if ((m = path.match(/^\/billing\/clinic-patient\/([^/]+)$/))) return billingStatus(decodeURIComponent(m[1]), q);
  if ((m = path.match(/^\/patients\/([^/]+)\/billing\/([^/]+)$/))) return billDetail(m[1], m[2]);

  if (path === "/get-template") {
    const page = num(q.get("page"), 1);
    const limit = num(q.get("limit"), 10);
    return {
      success: true,
      status: true,
      data: paginate(templates, page, limit),
      pagination: { totalRecords: templates.length, currentPage: page, limit, totalPages: Math.ceil(templates.length / limit) },
    };
  }
  if ((m = path.match(/^\/template\/([^/]+)$/))) {
    return { success: true, status: true, data: templates.find((t) => t._id === m[1]) || templates[0] };
  }
  if (path === "/getcategory/filters") {
    const category = q.get("category");
    const data = category ? videosFor(category) : [...videosFor("Activity"), ...videosFor("Relax"), ...videosFor("Learn")];
    return { success: true, status: true, data };
  }

  if ((m = path.match(/^\/getprofile\/([^/]+)$/))) return profile(m[1]);

  if ((m = path.match(/^\/chat-notifications\/([^/]+)$/))) return chatNotifications();
  if (path === "/patients/escalation-notifications-count") {
    return { success: true, data: { unreadEscalations: latestEscalations.filter((e) => !e.latestEscalation.isAcknowledged).length } };
  }
  if (path === "/patient/latest-escalations") return { success: true, data: latestEscalations };
  if (path === "/patients/provider-response-notifications") return { success: true, data: { notifications: providerResponses } };
  if (path === "/patients/provider-response-notifications-count") return { success: true, data: { unreadResponses: providerResponses.length } };
  if (seg[0] === "notifications" && seg[3] === "unread-count") {
    return { success: true, unreadCount: systemNotifications.filter((n) => !n.isRead).length };
  }
  if (seg[0] === "notifications" && seg.length === 3) {
    return { success: true, notifications: systemNotifications, total: systemNotifications.length, page: 1, limit: 20 };
  }

  return undefined;
};

export default handler;
