////////////////////////////routes/////////////////////////////////////////
import React from "react";
import AuditLog from "./views/pages/admin/reportAnalytics/AuditLog";

const Clinics = React.lazy(() => import("./views/pages/admin/clinic/Clinic"));
const ClinicDetail = React.lazy(() => import("./views/pages/admin/clinic/ClinicDetail"));
const Patients = React.lazy(() => import("./views/pages/admin/patients/PatientList"));
const UpdatedBilledStatuses = React.lazy(() => import("./views/pages/admin/clinic/UpdatedBilledStatus"));
const BilledStatus = React.lazy(() => import("./views/pages/admin/clinic/BilledStatus"));
const Users = React.lazy(() => import("./views/pages/admin/users/UserList"));
const UserDetail = React.lazy(() => import("./views/pages/admin/users/UserDetail"));
const ReportNanalytics = React.lazy(() => import("./views/pages/admin/reportAnalytics/ReportNanalytics"));
const MyPatients = React.lazy(() => import("./views/pages/provider/MyPatients"));
const MyPatientsDetails = React.lazy(() => import("./views/pages/provider/MyPatientDetails"));
const Messages = React.lazy(() => import("./views/pages/provider/Messages"));
const Coachpatients = React.lazy(() => import("./views/pages/coach/coachPatients/CoachPatient"));
const CoachPatientDetail = React.lazy(() => import("./views/pages/coach/coachPatients/CoachPatientDetail"));
const CallLog = React.lazy(() => import("./views/pages/coach/callLogs/CallLog"));
const PolicyReference = React.lazy(() => import("./views/pages/coach/policyReference/PolicyReference"));
const RTMDashboardPage = React.lazy(() => import('./views/pages/coach/RTMdashboard/RtmDashboard'));
const Task = React.lazy(() => import("./views/pages/admin/clinic/Task"));
const Support = React.lazy(() => import("./views/pages/admin/clinic/Support"));
const CreateBilling = React.lazy(() => import("./views/pages/coach/coachPatients/CreateBilling"));
const EditBilling = React.lazy(() => import("./views/pages/coach/coachPatients/EditBill"));
const Escalaction = React.lazy(() => import("./views/pages/provider/Escalaction"));
const TaskDetails = React.lazy(() => import("./views/pages/admin/clinic/TaskDetails"));
const SignOffForm = React.lazy(() => import("./views/pages/provider/SignOffListing"));
const AdminDashboard = React.lazy(() => import("./views/pages/admin/dashboard/AdminDashboard"));

// Admin Routes
const adminRoutes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/clinics", name: "List of Clinic", element: Clinics },
  { path: "/clinics/clinicDetail", name: "Clinic Detail", element: ClinicDetail },
  { path: "/patients", name: "Patients", element: Patients },
  { path: "/users", name: "User", element: Users },
  { path: "/users/userDetail", name: "User Detail", element: UserDetail },
  { path: "/contentManagement", name: "ContentManagement", element: PolicyReference },
  { path: "/report", name: "Report & analytics", element: ReportNanalytics },
  { path: "/dashboard", name: "Dashboard", element: AdminDashboard },
  { path: "/task", name: "Task templete", element: Task },
  { path: "/task-details", name: "Task Details", element: TaskDetails },
  { path: "/admin/patient-detail", name: "Coach Patient Detail", element: CoachPatientDetail },
  { path: "/audit-log", name: "Audit Logs", element: AuditLog },
  { path: "/updateBilledStatus", name: "Update Billed Status", element: UpdatedBilledStatuses },
  { path: "/bill-status", name: "Update Billed Status", element: BilledStatus },
];

// Sub Admin Routes (same as admin but without billing)
const subAdminRoutes = adminRoutes.filter(
  (r) => r.path !== "/updateBilledStatus" && r.path !== "/bill-status"
);

// Clinic Admin  Routes
const clinicAdminRoutes = [
  { path: "/patients", name: "Patients", element: Patients },
  { path: "/updateBilledStatus", name: "Update Billed Status", element: UpdatedBilledStatuses },
  { path: "/bill-status", name: "Update Billed Status", element: BilledStatus },
  { path: "/sign-off", name: "Sign Off Form", element: SignOffForm },
  { path: "/clinic/patient-detail", name: "Coach Patient Detail", element: CoachPatientDetail },
];

// Provider Routes
const providerRoutes = [
  { path: "/mypatients", name: "My Patients", element: MyPatients },
  { path: "/mypatients/details", name: "Patient Detail", element: MyPatientsDetails },
  { path: "/messages", name: "Message Coach", element: Messages },
  { path: "/sign-off", name: "Sign Off Form", element: SignOffForm }
];

// Coach Routes
const coachRoutes = [
  { path: "/coachPatients", name: "Coach Patients", element: Coachpatients },
  { path: "/coachPatientDetail", name: "Coach Patient Detail", element: CoachPatientDetail },
  { path: "/callLog", name: "Call Log", element: CallLog },
  { path: "/policyReference", name: "Policy Reference", element: PolicyReference },
  { path: '/rtmDashboard', name: "RTM Dashboard", element: RTMDashboardPage },
  { path: "/task", name: "Task templete", element: Task },
  { path: "/task-details", name: "Task Details", element: TaskDetails },
  { path: "/support", name: "Support", element: Support },
  { path: "/createBilling", name: "CreateBilling", element: CreateBilling },
  { path: "/edit-billing", name: "EditBilling", element: EditBilling },
  { path: "/Escalations", name: "Escalations", element: Escalaction },
  { path: "/bill-status", name: "Update Billed Status", element: BilledStatus },
];

export default { adminRoutes, subAdminRoutes, providerRoutes, coachRoutes, clinicAdminRoutes };  
