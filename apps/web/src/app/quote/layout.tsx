import { quoteMetadata } from "../../components/quote/metadata";

// Covers loading, errors and 404s as well as the successful customer proposal.
export const metadata = quoteMetadata;
export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
