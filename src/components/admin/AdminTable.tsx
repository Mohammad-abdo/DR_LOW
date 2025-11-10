import { Link } from "react-router-dom";
import type { Admin } from "../../services/admin-service";
import { Pencil, Trash2, Eye } from "lucide-react";

interface AdminTableProps {
  data: Admin[];
  onDelete: (id: number) => void;
  isDeleting?: number | null;
}

export const AdminTable = ({ data, onDelete, isDeleting }: AdminTableProps) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-gradient-to-r from-[#173468]/40 via-white/10 to-[#C7A46A]/30 backdrop-blur">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-transparent">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-10 text-center text-sm text-muted-foreground"
              >
                No admins found. Start by creating a new admin.
              </td>
            </tr>
          ) : (
            data.map((admin) => (
              <tr
                key={admin.id}
                className="transition hover:bg-secondary/40"
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {admin.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {admin.email}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {admin.phone ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#173468]/70 to-[#C7A46A]/70 px-2.5 py-1 text-xs font-semibold text-white shadow">
                    {admin.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admins/${admin.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/10"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                    <Link
                      to={`/admins/${admin.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/10"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(admin.id)}
                      disabled={isDeleting === admin.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive-foreground transition hover:bg-destructive/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                      {isDeleting === admin.id ? "Removing..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

