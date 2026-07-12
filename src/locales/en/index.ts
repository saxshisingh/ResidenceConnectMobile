import apartment from "./apartment.json";
import user from "./user.json";
import common from "./common.json";
import header from "./header.json";
import sidebar from "./sidebar.json";
import settings from "./settings.json";
import notification from "./notification.json";
import vehicle from "./vehicle.json";
import securityStaff from "./security-staff.json";
import alert from "./alert-notification.json";
import role from "./role.json";
import units from "./units.json";
import resident from "./resident.json";
import familyMember from "./family-member.json";
import residence from "./residence.json";
import block from "./block.json";
import floor from "./floor.json";
import payment from "./payment.json";
import accessDevice from "./access-device.json";
import logs from "./access-logs.json";
import parking from "./parking.json";
import dashboard from "./dashboard.json";
import report from "./reports.json";
import serviceCategory from "./service-category.json";
import technician from "./technician.json";
import maintenanceRequest from "./maintenance-request.json";
import communityBoard from "./community-board.json";
import chat from "./chat.json";

const en = {
    common: {
        ...common,
        home: {
            ...common.home,
            mobile: {
                ...common.home?.mobile,
                allFeatures: "All Features",
                alertsLabel: "ALERTS",
                maintenanceLabel: "MAINTENANCE",
                duesLabel: "DUES",
            },
        },
        bills: {
            ...(common as any).bills,
            mobile: {
                ...((common as any).bills?.mobile ?? {}),
                heroSubtitle: "Track and manage your utility bills",
                unpaidLabel: "UNPAID",
                paidLabel: "PAID",
                dueLabel: "DUE",
            },
        },
        neighbors: {
            ...common.neighbors,
            mobile: {
                ...common.neighbors?.mobile,
                viewAllResidents: "View all residents",
            },
        },
        parking: {
            ...common.parking,
            mobile: {
                ...common.parking?.mobile,
                manageSlots: "Manage your parking slot assignments",
                assignedSlots: "Your assigned parking slots",
                slotsCountLabel: "SLOTS",
            },
        },
        auth: {
            ...common.auth,
            mobile: {
                ...common.auth?.mobile,
                loginFailedMessage: "Unable to log in right now. Please try again.",
                wrongPassword: "Wrong password. Please try again.",
                sessionExpired: "Your session expired. Please log in again.",
            },
        },
    },
    notification: {
        ...notification,
        list: {
            ...notification.list,
            title: "Notifications",
            subtitle: "Your latest updates & alerts",
            recent: "RECENT",
            total: "TOTAL",
            unread: "UNREAD",
            emptyTitle: "No Notifications",
            emptyTitleSuffix: "Right Now",
            emptyDescription: "We'll notify you when something important comes up.",
        },
        view: {
            ...notification.view,
            title: "Notification Details",
            notFound: "Notification not found",
            goBack: "Go Back",
            messageLabel: "Message",
            readStatus: "Read",
        },
    },
    alert: {
        ...alert,
        mobile: {
            ...alert.mobile,
            system: {
                ...alert.mobile?.system,
                title: "Alert System",
                heroSubtitle: "Stay informed about your building's safety alerts",
                emergencyTitle: "Emergency Use Only",
                emergencyText: "Triggering an alert will notify all relevant residents and the management team immediately.",
                allResidenceNews: "All Residence News",
                loadingAlerts: "Loading alerts...",
                noResidenceNewsYet: "No residence news yet",
                noAlertsYetDesc: "Recent emergency alerts will appear here.",
                total: "Total",
            },
        },
    },
    apartment,
    user,
    header,
    sidebar,
    settings,
    vehicle,
    securityStaff,
    role,
    units,
    resident,
    familyMember,
    residence,
    block,
    floor,
    payment,
    accessDevice,
    logs,
    parking,
    dashboard,
    report,
    serviceCategory,
    technician,
    maintenanceRequest,
    communityBoard,
    chat
};

export default en;
