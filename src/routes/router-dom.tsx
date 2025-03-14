import DoctorCheckIn from "@/private/doctor-check-in-out/DoctorCheckIn";
import DoctorCheckInLayout from "@/private/doctor-check-in-out/DoctorCheckInLayout";
import DoctorDashboard from "@/private/doctor-dashboard/DoctorDashboard";
import DoctorDashboardLayout from "@/private/doctor-dashboard/DoctorDashboardLayout";
import UserAppointment from "@/private/user-appointment/UserAppointment";
import SignIn from "@/public/SignIn";
import MedicineStock from "@/private/medicine-stock/MedicineStock";
import MedicineStockLayout from "@/private/medicine-stock/MedicineStockLayout";
import { createBrowserRouter } from "react-router-dom";
import UserProfileLayout from "@/private/user-profile/UserProfileLayout";
import UserProfile from "@/private/user-profile/UserProfile";
import UserAppointmentLayout from "@/private/user-appointment/UserAppointmentLayout";
import UserDasboardLayout from "@/private/user-dashboard/UserDasboardLayout";
import UserDashboard from "@/private/user-dashboard/UserDashboard";
import UserPrescription from "@/private/user-prescription/UserPrescription";
import UserPrescriptionLayout from "@/private/user-prescription/UserPrescriptionLayout";
import AssistantDoctorDashboardLayout from "@/private/assistant-dashboard/AssistantDoctorDashboardLayout";
import AssistantDoctorDashboard from "@/private/assistant-dashboard/AssistantDoctorDashboard";
import PatientList from "@/private/patient-list/PatientList";
import PatientListLayout from "@/private/patient-list/PatientListLayout";
import UserRegister from "@/public/UserRegister";
import EmergencyLayout from "@/private/emergency/EmergencyLayout";
import Emergency from "@/private/emergency/Emergency";
import Ambulance from "@/private/ambulance/Ambulance";
import AmbulanceLayout from "@/private/ambulance/AmbulanceLayout";
import PatientDetailsLayout from "@/private/patient-details/PatientDetailsLayout";
import PatientDetails from "@/private/patient-details/PatientDetails";
import CommonPrescriptionLayout from "@/private/common-prescription/CommonPrescriptionLayout";
import CommonPrescription from "@/private/common-prescription/CommonPrescription";
import AdminSignIn from "@/public/AdminSignIn";
import AdminDashboard from "@/private/admin-dashboard/AdminDashboard";
import AdminDashboardLayout from "@/private/admin-dashboard/AdminDashboardLayout";
import NewDoctorLayout from "@/private/new-doctor/NewDoctorLayout";
import NewDoctor from "@/private/new-doctor/NewDoctor";
import NewAssistantDoctorLayout from "@/private/new-assistant-doctor/NewAssistantDoctorLayout";
import NewAssistantDoctor from "@/private/new-assistant-doctor/NewAssistantDoctor";
import TokenPageLayout from "@/private/token-page/tokenPageLayout";
import TokenPage from "@/private/token-page/tokenPage";
import PatientLogsLayout from "@/private/Patient-Logs/PatientLogsLayout";
import PatientLogs from "@/private/Patient-Logs/PatientLogs";
import AdHocTreatmentLayout from "@/private/Ad-Hoc Treatment/AdHocTreatmentLayout";
import AdHocTreatment from "@/private/Ad-Hoc Treatment/AdHocTreatment";
import PassChange from "@/public/PassChange";
import AnalyticsDashboardLayout from "@/private/Analytics-Dashboard/AnalyticsDashboardLayout";
import AnalyticsDashboard from "@/private/Analytics-Dashboard/AnalyticsDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/admin-portal",
    element: <AdminSignIn />,
  },
  {
    path: "/pass-change",
    element: <PassChange />,
  },
  {
    path: "/admin-dashboard",
    element: (
      <AdminDashboardLayout>
        <AdminDashboard></AdminDashboard>
      </AdminDashboardLayout>
    ),
  },
  {
    path: "/patient-logs",
    element: (
      <PatientLogsLayout>
        <PatientLogs></PatientLogs>
      </PatientLogsLayout>
    ),
  },
  {
    path: "/adhoc",
    element: (
      <AdHocTreatmentLayout>
        <AdHocTreatment></AdHocTreatment>
      </AdHocTreatmentLayout>
    ),
  },
  {
    path: "/register-doctor",
    element: (
      <NewDoctorLayout>
        <NewDoctor></NewDoctor>
      </NewDoctorLayout>
    ),
  },
  {
    path: "/register-assistant-doctor",
    element: (
      <NewAssistantDoctorLayout>
        <NewAssistantDoctor></NewAssistantDoctor>
      </NewAssistantDoctorLayout>
    ),
  },
  {
    path: "/register",
    element: <UserRegister></UserRegister>,
  },
  {
    path: "/patient-profile",
    element: (
      <UserProfileLayout>
        <UserProfile />
      </UserProfileLayout>
    ),
  },
  {
    path: "/patient-appointment",
    element: (
      <UserAppointmentLayout>
        <UserAppointment />
      </UserAppointmentLayout>
    ),
  },
  {
    path: "/patient-dashboard",
    element: (
      <UserDasboardLayout>
        <UserDashboard />
      </UserDasboardLayout>
    ),
  },
  {
    path: "/patient-prescription",
    element: (
      <UserPrescriptionLayout prevRef={null}>
        <UserPrescription />
      </UserPrescriptionLayout>
    ),
  },
  {
    path: "/patient-assigned-prescription",
    element: (
      <UserPrescriptionLayout prevRef="/patient-details">
        <UserPrescription />
      </UserPrescriptionLayout>
    ),
  },
  {
    path: "/doctor-dashboard",
    element: (
      <DoctorDashboardLayout>
        <DoctorDashboard />
      </DoctorDashboardLayout>
    ),
  },
  {
    path: "/ad-dashboard",
    element: (
      <AssistantDoctorDashboardLayout>
        <AssistantDoctorDashboard />
      </AssistantDoctorDashboardLayout>
    ),
  },
  {
    path: "/analytics-dashboard",
    element: (
      <AnalyticsDashboardLayout>
        <AnalyticsDashboard />
      </AnalyticsDashboardLayout>
    ),
  },
  {
    path: "/doctor-check-in-out",
    element: (
      <DoctorCheckInLayout>
        <DoctorCheckIn />
      </DoctorCheckInLayout>
    ),
  },
  {
    path: "/medicine-stock",
    element: (
      <MedicineStockLayout>
        <MedicineStock />
      </MedicineStockLayout>
    ),
  },
  {
    path: "/patient-list",
    element: (
      <PatientListLayout>
        <PatientList />
      </PatientListLayout>
    ),
  },
  {
    path: "/patient-details",
    element: (
      <PatientDetailsLayout>
        <PatientDetails />
      </PatientDetailsLayout>
    ),
  },

  {
    path: "/emergency",
    element: (
      <EmergencyLayout>
        <Emergency />
      </EmergencyLayout>
    ),
  },

  {
    path: "/ambulance",
    element: (
      <AmbulanceLayout>
        <Ambulance />
      </AmbulanceLayout>
    ),
  },
  {
    path: "/prescription",
    element: (
      <CommonPrescriptionLayout prevRef="/patient-prescription">
        <CommonPrescription />
      </CommonPrescriptionLayout>
    ),
  },
  {
    path: "/appointed-prescription",
    element: (
      <CommonPrescriptionLayout prevRef="/patient-list">
        <CommonPrescription />
      </CommonPrescriptionLayout>
    ),
  },
  {
    path: "/previous-prescription",
    element: (
      <CommonPrescriptionLayout prevRef="/patient-logs">
        <CommonPrescription />
      </CommonPrescriptionLayout>
    ),
  },
  {
    path: "/doctor-prescription",
    element: (
      <CommonPrescriptionLayout prevRef="/patient-details">
        <CommonPrescription />
      </CommonPrescriptionLayout>
    ),
  },
  {
    path: "/token-page",
    element: (
      <TokenPageLayout>
        <TokenPage></TokenPage>
      </TokenPageLayout>
    ),
  },
]);

export default router;
