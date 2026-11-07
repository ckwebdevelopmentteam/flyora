import { notFound } from "next/navigation";
import { getPublicQuote } from "../../../components/quote/getPublicQuote";
import { quoteMetadata } from "../../../components/quote/metadata";
import { QuoteProposal } from "../../../components/quote/QuoteProposal";
import { QuoteUnavailable } from "../../../components/quote/QuoteStates";

export function generateMetadata() {
  // Generic metadata keeps customer names, prices and bearer share tokens out of previews.
  return quoteMetadata;
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getPublicQuote(token);
  if (result.kind === "not-found") notFound();
  if (result.kind === "unavailable") return <QuoteUnavailable />;
  return <QuoteProposal quote={result.quote} initialNow={result.receivedAt} />;
}
