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

const fr = {
    common: {
        ...common,
        oops: "Oups",
        notAvailable: "Indisponible",
        home: {
            ...common.home,
            mobile: {
                ...common.home?.mobile,
                allFeatures: "Toutes les fonctionnalites",
                alertsLabel: "ALERTES",
                maintenanceLabel: "MAINTENANCE",
                duesLabel: "DUS",
            },
        },
        bills: {
            ...((common as any).bills ?? {}),
            mobile: {
                ...((common as any).bills?.mobile ?? {}),
                heroSubtitle: "Suivez et gerez vos factures de services",
                unpaidLabel: "IMPAYEES",
                paidLabel: "PAYEES",
                utilityBills: "Services",
                noUtilityBills: "Aucune facture de services",
                utilityBillsAppearHere: "Les factures d'eau, de gaz et d'electricite apparaitront ici",
                dueLabel: "DU",
                viewBill: "Voir la facture",
                viewer: {
                    bill: "Facture",
                    pdf: "PDF",
                    image: "Image",
                    document: "Document",
                    done: "Termine",
                    failedToLoad: "Impossible de charger le document",
                    unavailable: "Le document de facture n'est pas disponible pour le moment.",
                    unsupported: "Ce type de fichier n'est pas encore pris en charge dans l'application.",
                    tryAgain: "Impossible de charger la facture. Veuillez reessayer.",
                    loadingPdf: "Chargement du PDF...",
                    loadingDocument: "Chargement du document..."
                },
                types: {
                    maintenance: "Maintenance",
                    water: "Eau",
                    electricity: "Electricite",
                    gas: "Gaz"
                }
            },
        },
        neighbors: {
            ...common.neighbors,
            mobile: {
                ...common.neighbors?.mobile,
                viewAllResidents: "Voir tous les residents",
                residence: "Residence",
                occupancy: "Occupation",
                maxResidents: "Residents max.",
                utilityInformation: "Informations des compteurs",
                waterMeter: "Compteur d'eau",
                gasMeter: "Compteur de gaz",
                electricityMeter: "Compteur d'electricite"
            },
        },
        parking: {
            ...common.parking,
            mobile: {
                ...common.parking?.mobile,
                manageSlots: "Gerer vos affectations de stationnement",
                assignedSlots: "Vos places de stationnement attribuees",
                slotsCountLabel: "PLACES",
            },
        },
        auth: {
            ...(common as any).auth,
            mobile: {
                ...((common as any).auth?.mobile ?? {}),
                loginFailed: "Echec de connexion",
                loginFailedMessage: "Connexion impossible pour le moment. Veuillez reessayer.",
                wrongPassword: "Mot de passe incorrect. Veuillez reessayer.",
                sessionExpired: "Votre session a expire. Veuillez vous reconnecter.",
            },
        },
        family: {
            ...((common as any).family ?? {}),
            mobile: {
                ...((common as any).family?.mobile ?? {}),
                fullName: "Nom complet",
                fullNamePlaceholder: "Emma Aryan",
                relationPlaceholder: "Soeur",
                mobilePlaceholder: "05XXXXXXXX ou +213XXXXXXXXX",
                emailPlaceholder: "emma@example.com",
                residentMissing: "Les informations du resident sont manquantes",
                validationNameRelation: "Veuillez saisir le nom complet et la relation",
                validationFullNameLength: "Le nom complet doit contenir entre 2 et 80 caracteres",
                validationRelationLength: "La relation doit contenir entre 2 et 40 caracteres",
                validationStatus: "Veuillez selectionner un statut valide",
                validationMobile: "Veuillez saisir un numero de mobile algerien valide",
                validationEmail: "Veuillez saisir une adresse e-mail valide",
                familyMemberIdMissing: "L'identifiant du membre de la famille est manquant",
                memberFallback: "Membre de la famille",
                relationNotSet: "Relation non definie",
                emptyTitle: "Aucun membre de la famille ajoute",
                emptyDescription: "Ajoutez vos membres de famille pour gerer leurs details."
            }
        },
        security: {
            ...((common as any).security ?? {}),
            mobile: {
                ...((common as any).security?.mobile ?? {}),
                noSecurityAssigned: "Aucune equipe de securite n'est assignee pour le moment. Veuillez reessayer plus tard."
            }
        },
    },
    mobile: {
        ...((common as any).mobile ?? {}),
        smartAccess: {
            ...((common as any).mobile?.smartAccess ?? {}),
            devices: {
                ...((common as any).mobile?.smartAccess?.devices ?? {}),
                commandInProgressTitle: "Veuillez patienter",
                commandInProgressMessage: "Veuillez reessayer dans un instant.",
                loadingDescription: "Recuperation de vos appareils d'acces intelligent.",
                emptyDescription: "Contactez le gestionnaire de l'immeuble pour obtenir les autorisations d'acces."
            }
        },
        ttlock: {
            ...((common as any).mobile?.ttlock ?? {}),
            commandInProgressTitle: "Veuillez patienter",
            commandInProgressMessage: "Veuillez reinitialiser ou reessayer dans un instant.",
            lockUnavailableTitle: "Serrure indisponible",
            lockUnavailableMessage: "Cette serrure n'est pas connectee a proximite pour le moment. Rapprochez-vous de la serrure et reessayez.",
            lockNeedsInitializationMessage: "Cette serrure semble avoir ete reinitialisee ou supprimee. Veuillez initialiser votre appareil a nouveau."
        }
    },
    notification: {
        ...notification,
        list: {
            ...notification.list,
            title: "Notifications",
            subtitle: "Vos dernieres mises a jour et alertes",
            recent: "RECENTES",
            total: "TOTAL",
            unread: "NON LUES",
            emptyTitle: "Aucune notification disponible",
            emptyTitleSuffix: "pour le moment",
            emptyDescription: "Nous vous informerons quand quelque chose d'important arrivera.",
        },
        view: {
            ...notification.view,
            title: "Details de la notification",
            notFound: "Notification introuvable",
            goBack: "Retour",
            messageLabel: "Message",
            readStatus: "Lu",
        },
    },
    alert: {
        ...alert,
        mobile: {
            ...alert.mobile,
            system: {
                ...alert.mobile?.system,
                title: "Systeme d'alerte",
                heroSubtitle: "Restez informe des alertes de securite de votre residence",
                emergencyTitle: "Usage d'urgence uniquement",
                emergencyText: "Le declenchement d'une alerte informe immediatement les residents concernes et l'equipe de gestion.",
                allResidenceNews: "Toutes les actualites de la residence",
                loadingAlerts: "Chargement des alertes...",
                noResidenceNewsYet: "Aucune actualite de la residence pour le moment",
                noAlertsYetDesc: "Les alertes d'urgence recentes s'afficheront ici.",
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

export default fr;
