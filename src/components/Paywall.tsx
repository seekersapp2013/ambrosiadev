import { PaymentFlow } from './UnifiedPayment';
import { Id } from "../../convex/_generated/dataModel";

interface PaywallProps {
  contentType: "article" | "reel";
  contentId: Id<"articles"> | Id<"reels">;
  title: string;
  price: number;
  token: string;
  sellerAddress?: string;
  onBack: () => void;
  onSuccess: () => void;
  onFundWallet?: () => void;
}

export function Paywall(props: PaywallProps) {
  return <PaymentFlow {...props} />;
}
