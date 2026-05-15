import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },

  // Header
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },

  // Toggle Card
  toggleCard: {
    backgroundColor: colors.onPrimary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  liveGreen: {
    color: colors.primary,
    fontSize: 14,
  },
  liveGray: {
    color: colors.textMuted,
    fontSize: 14,
  },
  toggleDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Active Share Card
  activeShareCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeShareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeShareTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  changeBtn: {
    backgroundColor: colors.onPrimary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  activeShareText: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  activeShareTime: {
    fontSize: 12,
    color: colors.primary,
  },

  // Action Cards
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.onPrimary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapIconCircle: {
    backgroundColor: colors.backgroundAlt,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Info Section
  infoSection: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Map View
  mapActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mapActionBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  greenBtn: {
    backgroundColor: colors.primary,
  },
  redBtn: {
    backgroundColor: colors.danger,
  },
  mapActionText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Map Container
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.onPrimary,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onPrimary,
    marginRight: 6,
  },
  liveText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  locationInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.onPrimary,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  locationInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  locationInfoText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  locationInfoTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Shared With Screen
  sharedContainer: {
    padding: 4,
  },
  sharedMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sharedMainDesc: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
  },
  personCard: {
    backgroundColor: colors.onPrimary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.onPrimary,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  personStatus: {
    fontSize: 12,
    color: colors.textMuted,
  },
  personStatusOnline: {
    color: colors.primary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  manageSettingsBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addMoreBtn: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addMoreBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  // Settings Screen
  settingsContainer: {
    backgroundColor: colors.onPrimary,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionTitleSpacing: {
    marginTop: 24,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.surfaceMuted,
  },
  contactItemSelected: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  contactItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  durationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  durationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  saveBtn: {
    width: '48%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtn: {
    width: '48%',
    backgroundColor: colors.textMuted,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});




