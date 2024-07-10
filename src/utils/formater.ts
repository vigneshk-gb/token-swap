export const formatWalletHash = (hash: string) =>
    `${hash.slice(0, 13)}...${hash.slice(-10)}`;
  
  export const formatWalletHashSmaller = (hash: string) =>
    `${hash.slice(0, 7)}...${hash.slice(-7)}`;

  export function formatNumberWithCommas(number: number): string {
    if (number === 0) {
      return "0.00";
    }
    const formattedNumber = number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return formattedNumber;
  }