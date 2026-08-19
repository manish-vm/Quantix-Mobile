export const formatWeight = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(2)} kg` : 'N/A';
};

export const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

export const getScanStatus = (log) => {
  if (log?.status === 'match') return 'Match';
  if (Number(log?.measuredWeight) > Number(log?.expectedWeight ?? log?.overallWeight)) return 'Excess';
  return 'Short';
};

export const getScanDiff = (log) => {
  const expected = Number(log?.expectedWeight ?? log?.overallWeight);
  const measured = Number(log?.measuredWeight);
  if (!Number.isFinite(expected) || !Number.isFinite(measured)) return 'N/A';
  const diff = measured - expected;
  if (diff === 0) return '0 kg';
  return `${diff > 0 ? '+' : '-'}${Math.abs(diff).toFixed(2)} kg`;
};
