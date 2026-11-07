import { bookingMetadata } from "../../components/booking/metadata";

export const metadata = bookingMetadata;
export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
