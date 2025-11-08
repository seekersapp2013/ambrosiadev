import { WalletBalanceDisplay } from './UnifiedWallet';

interface WalletBalanceProps {
  onNavigate?: (screen: string) => void;
}

export function WalletBalance(props: WalletBalanceProps) {
  return <WalletBalanceDisplay {...props} />;
}