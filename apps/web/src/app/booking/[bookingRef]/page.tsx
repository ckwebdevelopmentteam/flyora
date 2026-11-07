import { notFound } from "next/navigation";
import { getPublicBooking } from "../../../components/booking/getPublicBooking";
import { BookingVoucher } from "../../../components/booking/BookingVoucher";
import { BookingUnavailable } from "../../../components/booking/BookingStates";
import { bookingMetadata } from "../../../components/booking/metadata";

export function generateMetadata() {
  return bookingMetadata;
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ bookingRef: string }>;
}) {
  const { bookingRef } = await params;
  const result = await getPublicBooking(bookingRef);
  if (result.kind === "not-found") notFound();
  if (result.kind === "unavailable") return <BookingUnavailable />;
  return <BookingVoucher booking={result.booking} />;
}
