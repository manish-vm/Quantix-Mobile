import { StyleSheet } from 'react-native';

export const colors = {
  background: '#f0f2f5',
  surface: '#ffffff',
  primary: '#1890ff',
  primaryDark: '#096dd9',
  primaryLight: '#40a9ff',
  text: '#333333',
  muted: '#666666',
  border: '#d9d9d9',
  danger: '#ff4d4f',
  dangerDark: '#cf1322',
  success: '#52c41a',
  successDark: '#389e0d',
  warning: '#faad14',
  softPrimary: '#e6eeff',
  softDanger: '#fff2f0',
  softSuccess: '#f6ffed',
  softWarning: '#fffbe6'
};

export const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 28
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 14
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14
  },
  label: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 7,
    fontSize: 13
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 13,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12
  },
  button: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 2
  },
  buttonSecondary: {
    backgroundColor: colors.softPrimary,
    borderColor: colors.primary,
    borderWidth: 1
  },
  buttonDanger: {
    backgroundColor: colors.danger
  },
  buttonDisabled: {
    opacity: 0.55
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15
  },
  buttonSecondaryText: {
    color: colors.primaryDark
  },
  row: {
    flexDirection: 'row'
  },
  flex: {
    flex: 1
  },
  error: {
    backgroundColor: colors.softDanger,
    color: colors.dangerDark,
    borderColor: '#ffccc7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  successBox: {
    backgroundColor: colors.softSuccess,
    borderColor: '#b7eb8f',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  warningBox: {
    backgroundColor: colors.softWarning,
    borderColor: '#ffe58f',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flex: 1,
    minWidth: 140,
    flexGrow: 1,
    backgroundColor: colors.softPrimary,
    borderRadius: 8,
    padding: 12
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4
  },
  metricValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold'
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    overflow: 'hidden',
    fontWeight: 'bold',
    fontSize: 12
  },
  pillSuccess: {
    backgroundColor: colors.softSuccess,
    color: colors.success
  },
  pillDanger: {
    backgroundColor: colors.softDanger,
    color: colors.danger
  },
  pillWarning: {
    backgroundColor: colors.softWarning,
    color: colors.warning
  },
  muted: {
    color: colors.muted
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    marginBottom: 14
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  segmentButtonActive: {
    backgroundColor: colors.primary
  },
  segmentText: {
    color: colors.muted,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center'
  },
  segmentTextActive: {
    color: '#ffffff'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: colors.border,
    borderBottomWidth: 1
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 13,
    flex: 1
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right'
  },
  itemTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4
  },
  listItem: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#fafafa'
  },
  barTrack: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: colors.softDanger,
    overflow: 'hidden',
    marginBottom: 12
  },
  barFill: {
    minHeight: 12,
    borderRadius: 999
  },
  headerButton: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.softPrimary
  },
  headerButtonText: {
    color: colors.primaryDark,
    fontWeight: 'bold'
  },
  tabBar: {
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopColor: colors.border
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.muted
  },
  tabLabelActive: {
    color: colors.primary
  }
});
