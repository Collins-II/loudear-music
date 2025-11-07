// lib/mobileMoneyConfig.ts
export const supportedMobileMoneyNetworks = {
  ZM: ["mtn", "airtel", "zamtel"], // Zambia
  UG: ["mtn", "airtel"], // Uganda
  GH: ["mtn", "vodafone", "airtel"], // Ghana
  KE: ["mtn", "airtel"], // Kenya
};

export function isNetworkSupported(country: string, network: string) {
  const networks = (supportedMobileMoneyNetworks as any)[country.toUpperCase()] || [];
  return networks.includes(network.toLowerCase());
}
