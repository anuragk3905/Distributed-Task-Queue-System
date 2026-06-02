import React from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50", className)}
        {...props}
      >
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="mb-1 font-semibold tracking-tight text-foreground">{title}</h3>
        {description && <p className="mb-4 text-sm text-muted-foreground max-w-sm">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
