export const formatLaunchDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const formatDistanceKm = (km: string) => {
  const value = Number(km);
  return Number.isFinite(value)
    ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} km`
    : km;
};

export const formatVelocity = (kmh: string) => {
  const value = Number(kmh);
  return Number.isFinite(value)
    ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} km/h`
    : kmh;
};
