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

const ar = {
    common: {
        ...common,
        oops: "عذرًا",
        notAvailable: "غير متوفر",
        home: {
            ...common.home,
            mobile: {
                ...common.home?.mobile,
                allFeatures: "كل الخدمات",
                alertsLabel: "التنبيهات",
                maintenanceLabel: "الصيانة",
                duesLabel: "المستحقات",
            },
        },
        bills: {
            ...(common as any).bills,
            mobile: {
                ...((common as any).bills?.mobile ?? {}),
                heroSubtitle: "تابع وأدر فواتير الخدمات لديك",
                unpaidLabel: "غير مدفوعة",
                paidLabel: "مدفوعة",
                utilityBills: "المرافق",
                noUtilityBills: "لا توجد فواتير مرافق",
                utilityBillsAppearHere: "ستظهر فواتير المياه والغاز والكهرباء هنا",
                dueLabel: "المستحق",
                viewBill: "عرض الفاتورة",
                viewer: {
                    bill: "فاتورة",
                    pdf: "PDF",
                    image: "صورة",
                    document: "مستند",
                    done: "تم",
                    failedToLoad: "تعذر تحميل المستند",
                    unavailable: "مستند الفاتورة غير متوفر حاليًا.",
                    unsupported: "هذا النوع من الملفات غير مدعوم داخل التطبيق حاليًا.",
                    tryAgain: "تعذر تحميل الفاتورة. يرجى المحاولة مرة أخرى.",
                    loadingPdf: "جارٍ تحميل ملف PDF...",
                    loadingDocument: "جارٍ تحميل المستند..."
                },
                types: {
                    maintenance: "الصيانة",
                    water: "المياه",
                    electricity: "الكهرباء",
                    gas: "الغاز"
                }
            },
        },
        neighbors: {
            ...common.neighbors,
            mobile: {
                ...common.neighbors?.mobile,
                viewAllResidents: "عرض جميع السكان",
                residence: "المجمع السكني",
                occupancy: "الإشغال",
                maxResidents: "الحد الأقصى للسكان",
                utilityInformation: "معلومات العدادات",
                waterMeter: "عداد المياه",
                gasMeter: "عداد الغاز",
                electricityMeter: "عداد الكهرباء"
            },
        },
        parking: {
            ...common.parking,
            mobile: {
                ...common.parking?.mobile,
                manageSlots: "إدارة تخصيصات مواقفك",
                assignedSlots: "مواقفك المخصصة",
                slotsCountLabel: "المواقف",
            },
        },
        auth: {
            ...common.auth,
            mobile: {
                ...common.auth?.mobile,
                loginFailedMessage: "تعذر تسجيل الدخول الآن. يرجى المحاولة مرة أخرى.",
                wrongPassword: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
                sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
            },
        },
        family: {
            ...((common as any).family ?? {}),
            mobile: {
                ...((common as any).family?.mobile ?? {}),
                fullName: "الاسم الكامل",
                fullNamePlaceholder: "محمد أحمد",
                relationPlaceholder: "أخت",
                mobilePlaceholder: "05XXXXXXXX",
                emailPlaceholder: "name@example.com",
                residentMissing: "بيانات المقيم غير متوفرة",
                validationNameRelation: "يرجى إدخال الاسم الكامل وصلة القرابة",
                validationFullNameLength: "يجب أن يكون الاسم الكامل بين 2 و80 حرفًا",
                validationRelationLength: "يجب أن تكون صلة القرابة بين 2 و40 حرفًا",
                validationStatus: "يرجى اختيار حالة صحيحة",
                validationMobile: "يرجى إدخال رقم جوال صحيح",
                validationEmail: "يرجى إدخال بريد إلكتروني صحيح",
                familyMemberIdMissing: "معرّف فرد العائلة غير متوفر",
                memberFallback: "فرد من العائلة",
                relationNotSet: "صلة القرابة غير محددة",
                emptyTitle: "لا يوجد أفراد عائلة حتى الآن",
                emptyDescription: "أضف أفراد عائلتك لإدارة بياناتهم."
            }
        },
        security: {
            ...((common as any).security ?? {}),
            mobile: {
                ...((common as any).security?.mobile ?? {}),
                noSecurityAssigned: "لا يوجد فريق أمن مخصص حاليًا. يرجى المحاولة لاحقًا."
            }
        },
    },
    mobile: {
        ...((common as any).mobile ?? {}),
        smartAccess: {
            ...((common as any).mobile?.smartAccess ?? {}),
            devices: {
                ...((common as any).mobile?.smartAccess?.devices ?? {}),
                commandInProgressTitle: "يرجى الانتظار",
                commandInProgressMessage: "يرجى المحاولة بعد لحظات.",
                loadingDescription: "جارٍ جلب أجهزة الوصول الذكي الخاصة بك الآن.",
                emptyDescription: "تواصل مع إدارة المبنى للحصول على صلاحيات الوصول."
            }
        },
        ttlock: {
            ...((common as any).mobile?.ttlock ?? {}),
            commandInProgressTitle: "يرجى الانتظار",
            commandInProgressMessage: "يرجى إعادة التهيئة أو المحاولة بعد لحظات.",
            lockUnavailableTitle: "القفل غير متاح",
            lockUnavailableMessage: "هذا القفل غير متصل بالقرب منك الآن. اقترب من القفل وحاول مرة أخرى.",
            lockNeedsInitializationMessage: "يبدو أن هذا القفل تمت إعادة تهيئته أو إزالته. يرجى إعادة تهيئة جهازك مرة أخرى."
        }
    },
    notification: {
        ...notification,
        list: {
            ...notification.list,
            title: "الإشعارات",
            subtitle: "آخر التحديثات والتنبيهات",
            recent: "الأحدث",
            total: "الإجمالي",
            unread: "غير مقروءة",
            emptyTitle: "لا توجد إشعارات",
            emptyTitleSuffix: "حاليًا",
            emptyDescription: "سنخطرك عند وصول أي تحديث مهم.",
        },
        view: {
            ...notification.view,
            title: "تفاصيل الإشعار",
            notFound: "الإشعار غير موجود",
            goBack: "عودة",
            messageLabel: "الرسالة",
            readStatus: "مقروء",
        },
    },
    alert: {
        ...alert,
        mobile: {
            ...alert.mobile,
            system: {
                ...alert.mobile?.system,
                title: "نظام التنبيهات",
                heroSubtitle: "ابقَ على اطلاع بآخر تنبيهات السلامة في مبناك",
                emergencyTitle: "للطوارئ فقط",
                emergencyText: "سيؤدي إطلاق التنبيه إلى إخطار جميع السكان المعنيين وفريق الإدارة فورًا.",
                allResidenceNews: "جميع أخبار السكن",
                loadingAlerts: "جارٍ تحميل التنبيهات...",
                noResidenceNewsYet: "لا توجد أخبار سكن بعد",
                noAlertsYetDesc: "ستظهر التنبيهات الطارئة الأخيرة هنا.",
                total: "الإجمالي",
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
    chat: {
        ...chat,
        mobile: {
            ...((chat as any).mobile ?? {}),
            unreadCount: "{{count}} \u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629",
        },
    },
};

export default ar;
