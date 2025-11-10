import type { Employee } from "../../services/employee-service";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  isError,
  onRetry,
}: EmployeeTableProps) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#173468] border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 rounded-3xl border border-destructive/40 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-amber-400/20 p-6 text-destructive-foreground backdrop-blur">
        <p>Unable to load employees right now. Please try again.</p>
        {onRetry ? (
          <button
            onClick={onRetry}
            className="rounded-lg border border-destructive/50 bg-destructive/30 px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/40"
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#173468]/20 via-white/10 to-[#C7A46A]/20 p-8 text-center text-sm text-muted-foreground shadow backdrop-blur">
        No employees found. Try adjusting your filters or create a new record.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#173468]/20 via-white/8 to-[#C7A46A]/20 shadow-xl backdrop-blur">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-gradient-to-r from-[#173468]/40 via-white/10 to-[#C7A46A]/30">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Iqama Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Upcoming Stage
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white/90">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {employees.map((employee) => (
            <tr key={employee.id} className="transition hover:bg-white/5">
              <td className="px-6 py-4 text-sm font-medium text-white">
                <div className="flex flex-col">
                  <span>{employee.name}</span>
                  {employee.job_title ? (
                    <span className="text-xs font-normal text-white/60">
                      {employee.job_title}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {employee.email ?? "—"}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {employee.phone ?? "—"}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {employee.company?.name ?? "—"}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {employee.iqamaType?.name?.en ?? "—"}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {employee.upcomingStage
                  ? `Stage ${employee.upcomingStage.stage_id} · ${employee.upcomingStage.status}`
                  : "—"}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#173468]/70 to-[#C7A46A]/70 px-2.5 py-1 text-xs font-semibold text-white shadow">
                  {employee.status ?? "N/A"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/employees/${employee.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/40 hover:bg-white/20"
                >
                  <Eye size={14} />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

