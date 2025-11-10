import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployee } from "../../services/employee-service";
import { PermissionGuard } from "../../routes/PermissionGuard";

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["employees", id],
    enabled: Boolean(id),
    queryFn: () => getEmployee(id ?? ""),
  });

  return (
    <PermissionGuard permission="employees">
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Employee Details
            </h1>
            <p className="text-sm text-white/70">
              Review employee profile and workflow progress.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
          >
            Back
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#173468] border-t-transparent" />
          </div>
        ) : isError || !data ? (
          <div className="space-y-3 rounded-3xl border border-destructive/40 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-amber-400/20 p-6 text-destructive-foreground backdrop-blur">
            <p>Unable to load this employee right now.</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-destructive/50 bg-destructive/30 px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/40"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#173468]/25 via-white/10 to-[#C7A46A]/20 p-6 shadow-xl backdrop-blur xl:col-span-2">
              <h2 className="text-lg font-semibold text-white">
                Personal & Employment Information
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-white/80 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Full Name
                  </dt>
                  <dd className="text-base text-white">{data.name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Email
                  </dt>
                  <dd>{data.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Phone
                  </dt>
                  <dd>{data.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Address
                  </dt>
                  <dd>{data.address ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Passport Number
                  </dt>
                  <dd>{data.passport_number ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Passport Expiry
                  </dt>
                  <dd>
                    {data.expired_date
                      ? new Date(data.expired_date).toLocaleDateString()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Salary
                  </dt>
                  <dd>{data.salary ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Status
                  </dt>
                  <dd>{data.status ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Iqama Type
                  </dt>
                  <dd>{data.iqamaType?.name?.en ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Company
                  </dt>
                  <dd>{data.company?.name ?? "—"}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#173468]/25 via-white/10 to-[#C7A46A]/20 p-6 shadow-xl backdrop-blur">
              <h2 className="text-lg font-semibold text-white">
                Workflow Stages
              </h2>
              <div className="mt-4 space-y-4">
                {data.employeeStages && data.employeeStages.length > 0 ? (
                  data.employeeStages.map((stage) => (
                    <div
                      key={stage.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
                        <span>Stage #{stage.stage_id}</span>
                        <span>{stage.status}</span>
                      </div>
                      <dl className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <dt>Completed</dt>
                          <dd>
                            {stage.completed_at
                              ? new Date(stage.completed_at).toLocaleString()
                              : "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between text-xs text-white/60">
                          <dt>Updated</dt>
                          <dd>
                            {stage.updated_at
                              ? new Date(stage.updated_at).toLocaleString()
                              : "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between text-xs text-white/60">
                          <dt>Files</dt>
                          <dd>{stage.files?.length ?? 0}</dd>
                        </div>
                      </dl>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                    No workflow history available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </PermissionGuard>
  );
};

export default EmployeeDetailPage;

