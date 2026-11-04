import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";

export function AccountCard() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>You are signed in to the demo workspace.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} className="size-11" />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              {user.email} · {user.role}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut /> Log out
        </Button>
      </CardContent>
    </Card>
  );
}
