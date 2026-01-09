export const blockchainUtils = {
  formatAddress: (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
  isValidAddress: (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
};