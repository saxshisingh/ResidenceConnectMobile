import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundAlt, 
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 32,
  },

  sectionHeader: {
    paddingBottom: 14,
    marginBottom: 16,
    borderBottomWidth: 1,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },

  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 14,
    flex: 1,
  },

  emergencyCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },

  emergencyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  pastWrapper: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    padding: 14,
  },

  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  pastTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  viewAll: {
    fontSize: 12,
    color: colors.primary,
  },

  pastCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  urgencyBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },

  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  pastAlert: {
    fontSize: 13,
    fontWeight: '500',
  },

  date: {
    fontSize: 11,
    color: colors.textMuted,
  },

  noAlertsText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.textMuted,
  },
  
});
