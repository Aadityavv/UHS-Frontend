import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public routes
import SignIn from "@/public/SignIn";
import AdminSignIn from "@/public/AdminSignIn";
import UserRegister from "@/public/UserRegister";
import PassChange from "@/public/PassChange";
import UserFeedback from "@/private/user-feedback/userfeedback";

// Admin routes
import AdminDashboard from "@/private/admin-dashboard/AdminDashboard";
import AdminDashboardLayout from "@/private/admin-dashboard/AdminDashboardLayout";
import NewDoctorLayout from "@/private/new-doctor/NewDoctorLayout";
import NewDoctor from "@/private/new-doctor/NewDoctor";
import NewAssistantDoctorLayout from "@/private/new-assistant-doctor/NewAssistantDoctorLayout";
import NewAssistantDoctor from "@/private/new-assistant-doctor/NewAssistantDoctor";
import AnalyticsDashboardLayout from "@/private/Analytics-Dashboard/AnalyticsDashboardLayout";
import AnalyticsDashboard from "@/private/Analytics-Dashboard/AnalyticsDashboard";
import BackupRestore from "@/private/Backup-Restore/BackupRestore";
import BackupRestoreLayout from "@/private/Backup-Restore/BackupRestoreLayout";
import UserManagement from "@/private/User-Management/UserManagement";
import UserManagementLayout from "@/private/User-Management/UserManagementLayout";
import SystemLogs from "@/private/System-Logs/SystemLogs";


// Patient routes
import UserDashboard from "@/private/user-dashboard/UserDashboard";
import UserDasboardLayout from "@/private/user-dashboard/UserDasboardLayout";
import UserProfile from "@/private/user-profile/UserProfile";
import UserProfileLayout from "@/private/user-profile/UserProfileLayout";
import UserAppointment from "@/private/user-appointment/UserAppointment";
import UserAppointmentLayout from "@/private/user-appointment/UserAppointmentLayout";
import UserPrescription from "@/private/user-prescription/UserPrescription";
import UserPrescriptionLayout from "@/private/user-prescription/UserPrescriptionLayout";
import ThankYou from "@/private/user-feedback/ThankYou";

// Doctor routes
import DoctorDashboard from "@/private/doctor-dashboard/DoctorDashboard";
import DoctorDashboardLayout from "@/private/doctor-dashboard/DoctorDashboardLayout";
import DoctorCheckIn from "@/private/doctor-check-in-out/DoctorCheckIn";
import DoctorCheckInLayout from "@/private/doctor-check-in-out/DoctorCheckInLayout";
import MedicineUsage from "@/private/medicine-usage/MedicineUsage";
import MedicineUsageLayout from "@/private/medicine-usage/MedicineUsageLayout";

// AD (Assistant Doctor) routes
import AssistantDoctorDashboard from "@/private/assistant-dashboard/AssistantDoctorDashboard";
import AssistantDoctorDashboardLayout from "@/private/assistant-dashboard/AssistantDoctorDashboardLayout";
import TokenPage from "@/private/token-page/tokenPage";
import TokenPageLayout from "@/private/token-page/tokenPageLayout";
import MedicineStock from "@/private/medicine-stock/MedicineStock";
import MedicineStockLayout from "@/private/medicine-stock/MedicineStockLayout";

// Shared private routes (Doctor/AD/Patient)
import PatientList from "@/private/patient-list/PatientList";
import PatientListLayout from "@/private/patient-list/PatientListLayout";
import PatientDetails from "@/private/patient-details/PatientDetails";
import PatientDetailsLayout from "@/private/patient-details/PatientDetailsLayout";
import PatientLogs from "@/private/Patient-Logs/PatientLogs";
import PatientLogsLayout from "@/private/Patient-Logs/PatientLogsLayout";
import AdHocTreatment from "@/private/Ad-Hoc Treatment/AdHocTreatment";
import AdHocTreatmentLayout from "@/private/Ad-Hoc Treatment/AdHocTreatmentLayout";
import Emergency from "@/private/emergency/Emergency";
import EmergencyLayout from "@/private/emergency/EmergencyLayout";
import Ambulance from "@/private/ambulance/Ambulance";
import AmbulanceLayout from "@/private/ambulance/AmbulanceLayout";
import CommonPrescription from "@/private/common-prescription/CommonPrescription";
import CommonPrescriptionLayout from "@/private/common-prescription/CommonPrescriptionLayout";
import VerifyPage from "@/public/VerifyPage";
import { UserForm } from "@/private/User-Management/UserForm";
import { EditUser } from "@/private/User-Management/EditUser";
import ManageDoctors from "@/private/Manage-Doctors/ManageDoctors";
import ManageAssistants from "@/private/Manage-Assistants/ManageAssistants";
import ManageDoctorsLayout from "@/private/Manage-Doctors/ManageDoctorsLayout";
import ManageAssistantsLayout from "@/private/Manage-Assistants/ManageAssistantsLayout";
import DeletedAppointments from "@/private/Deleted-Appointments/DeletedAppointments";
import DeletedAppointmentsLayout from "@/private/Deleted-Appointments/DeletedAppointmentsLayout";

const router = createBrowserRouter([
  // PUBLIC ROUTES
  { path: "/", element: <SignIn /> },
  { path: "/admin-portal", element: <AdminSignIn /> },
  { path: "/register", element: <UserRegister /> },
  { path: "/pass-change", element: <PassChange /> },
  { path: "/verify", element: <VerifyPage /> },


  // ADMIN PROTECTED ROUTES
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin-dashboard",
        element: (
          <AdminDashboardLayout>
            <AdminDashboard />
          </AdminDashboardLayout>
        ),
      },
      {
        path: "/register-doctor",
        element: (
          <NewDoctorLayout>
            <NewDoctor />
          </NewDoctorLayout>
        ),
      },
      {
        path: "/register-assistant-doctor",
        element: (
          <NewAssistantDoctorLayout>
            <NewAssistantDoctor />
          </NewAssistantDoctorLayout>
        ),
      },{
        path: "/admin/backup",
        element:(
        <BackupRestoreLayout>
        <BackupRestore />
        </BackupRestoreLayout>)
      },
      {
        path: "/admin/users",
        element: (
          <UserManagementLayout>
        <UserManagement />
        </UserManagementLayout>),
      },
      {
        path: "/admin/logs",
        element: <SystemLogs />,
      },
      {
        path: "/admin/users/new",
        element: <UserForm />,
      },
      {
        path: "/admin/users/edit/:id",
        element: <EditUser />,
      },
      {
        path: "/admin/manage-doctors",
        element: ( <ManageDoctorsLayout>
          <ManageDoctors />
        </ManageDoctorsLayout>),
      },
      {
        path: "/admin/manage-assistants",
        element: ( <ManageAssistantsLayout>
        <ManageAssistants />
        </ManageAssistantsLayout>
        ),
      },
      {
        path: "/admin/patient-logs",
        element:  <PatientLogsLayout>
        <PatientLogs />
      </PatientLogsLayout>
      },
      {
        path: "/admin/deleted-appointments",
        element: (
          <DeletedAppointmentsLayout>
            <DeletedAppointments />
            </DeletedAppointmentsLayout>
        )
      },
            {
        path: "/admin/medicine-usage",
        element: (
          <MedicineUsageLayout>
            <MedicineUsage/>
            </MedicineUsageLayout>
        )
      }
      
      
    ],
  },

  // PATIENT PROTECTED ROUTES
  {
    element: <ProtectedRoute allowedRoles={["patient"]} />,
    children: [
      {
        path: "/patient-dashboard",
        element: (
          <UserDasboardLayout>
            <UserDashboard />
          </UserDasboardLayout>
        ),
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
        path: "/feedback",
        element: <UserFeedback />,
      },
      {
        path: "/thank-you",
        element: <ThankYou />,
      },
      
    ],
  },

  // DOCTOR PROTECTED ROUTES
  {
    element: <ProtectedRoute allowedRoles={["doctor"]} />,
    children: [
      {
        path: "/doctor-dashboard",
        element: (
          <DoctorDashboardLayout>
            <DoctorDashboard />
          </DoctorDashboardLayout>
        ),
      },
      {
        path: "/doctor-prescription",
        element: (
          <CommonPrescriptionLayout>
            <CommonPrescription />
          </CommonPrescriptionLayout>
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
        path: "/medicine-usage",
        element: (
          <MedicineUsageLayout>
            <MedicineUsage />
          </MedicineUsageLayout>
        ),
      },
    ],
  },

  // ASSISTANT DOCTOR PROTECTED ROUTES
  {
    element: <ProtectedRoute allowedRoles={["ad"]} />,
    children: [
      {
        path: "/ad-dashboard",
        element: (
          <AssistantDoctorDashboardLayout>
            <AssistantDoctorDashboard />
          </AssistantDoctorDashboardLayout>
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
        path: "/token-page",
        element: (
          <TokenPageLayout>
            <TokenPage />
          </TokenPageLayout>
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
        path: "/patient-logs",
        element: (
          <PatientLogsLayout>
            <PatientLogs />
          </PatientLogsLayout>
        ),
      },
      {
        path: "/adhoc",
        element: (
          <AdHocTreatmentLayout>
            <AdHocTreatment />
          </AdHocTreatmentLayout>
        ),
      },
    ],
  },

  // SHARED PRIVATE ROUTES FOR MULTIPLE ROLES
  {
    element: <ProtectedRoute allowedRoles={["doctor", "ad", "patient","admin"]} />,
    children: [
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
          <CommonPrescriptionLayout>
            <CommonPrescription />
          </CommonPrescriptionLayout>
        ),
      },
      {
        path: "/appointed-prescription",
        element: (
          <CommonPrescriptionLayout >
            <CommonPrescription />
          </CommonPrescriptionLayout>
        ),
      },
      {
        path: "/previous-prescription",
        element: (
          <CommonPrescriptionLayout>
            <CommonPrescription />
          </CommonPrescriptionLayout>
        ),
      },
      
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={["doctor", "ad","admin"]} />,
    children: [
      {
        path: "/medicine-stock",
        element: (
          <MedicineStockLayout>
            <MedicineStock />
          </MedicineStockLayout>
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
      
    ]
  }
]);

export default router;