import { redirect } from "next/navigation";
import { logoutUser } from "@/lib/server/auth-actions";
import { cn } from "@/lib/utils/cn";

export function DashboardLogoutButton({ className }: { className?: string }) {
  async function handleLogout() {
    "use server";

    await logoutUser();
    redirect("/login");
  }

  return (
    <form action={handleLogout} className="w-full">
      <button
        type="submit"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400",
          className
        )}
      >
        Sign out
      </button>
    </form>
  );
}
