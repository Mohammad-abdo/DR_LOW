import type { ReactNode } from "react";

interface ResourcePlaceholderProps {
  title: string;
  description: string;
  helpText?: string;
  actions?: ReactNode;
}

export const ResourcePlaceholder = ({
  title,
  description,
  helpText,
  actions,
}: ResourcePlaceholderProps) => {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#173468]/15 via-white/12 to-[#C7A46A]/12 p-8 text-sm text-muted-foreground shadow-[0_24px_50px_-22px_rgba(23,52,104,0.6)] backdrop-blur-xl">
        <p>
          {helpText ??
            "Module tooling is ready for integration with backend APIs."}
        </p>
        {actions ? (
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
};

