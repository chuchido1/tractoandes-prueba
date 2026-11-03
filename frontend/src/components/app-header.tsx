import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import type { User } from "@/lib/types";

export function AppHeader({ user }: { user: User }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4">
        <Link href="/books" className="font-semibold">
          Catálogo de libros
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
