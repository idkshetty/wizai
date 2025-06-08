import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function Logo({ className }: { className?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span className={cn(
        "font-headline font-bold text-2xl text-sidebar-primary",
        isCollapsed && "hidden"
      )}>
        GeminiLite
      </span>
      <span className={cn(
        "font-headline font-bold text-2xl text-sidebar-primary",
        !isCollapsed && "hidden"
      )}>
        GL
      </span>
    </div>
  );
}
