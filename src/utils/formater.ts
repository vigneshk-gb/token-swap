export const formatWalletHash = (hash: string) =>
    `${hash.slice(0, 13)}...${hash.slice(-10)}`;
  
  export const formatWalletHashSmaller = (hash: string) =>
    `${hash.slice(0, 7)}...${hash.slice(-7)}`;