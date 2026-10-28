import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";

type StaffRow = {
  id: string;
  fullName: string;
  services: string[];
  availability: string;
  active: number;
  booked: number;
  followUpsDue: number;
};
export function StaffWorkload({ userId }: { userId: string }) {
  const query = useQuery({
    queryKey: ["dashboard", userId, "staff-workload"],
    queryFn: () => apiClient.get<StaffRow[]>("/leads/staff-workload"),
    staleTime: 30_000,
    refetchOnMount: "always",
  });
  return (
    <section className="surface p-5" aria-label="Staff workload">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Staff workload</h2>
        <Link className="text-sm text-indigo-600" to="/team">
          Manage team
        </Link>
      </div>
      {query.isPending ? (
        <p role="status">Loading staff…</p>
      ) : query.isError ? (
        <div role="alert">
          <p>We couldn't load staff workload.</p>
          <button
            className="button-secondary mt-3"
            onClick={() => void query.refetch()}
          >
            Try again
          </button>
        </div>
      ) : !query.data?.length ? (
        <p className="text-sm text-slate-500">No staff added yet.</p>
      ) : (
        <div className="staff-workload-list">
          {query.data.map((person) => (
            <Link
              key={person.id}
              to={`/admin/leads?assignedToId=${person.id}`}
              className="staff-workload-row"
            >
              <div className="min-w-0">
                <strong className="block text-sm">{person.fullName}</strong>
                <span className="text-xs text-slate-500">
                  {person.services.join(" · ") || "No services assigned"}
                </span>
              </div>
              <div className="staff-workload-counts">
                <span>
                  <strong>{person.active}</strong>Active
                </span>
                <span className={person.followUpsDue ? "text-amber-700" : ""}>
                  <strong>{person.followUpsDue}</strong>Due
                </span>
                <span>
                  <strong>{person.booked}</strong>Booked
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
