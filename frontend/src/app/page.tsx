"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState("tenant-demo-001");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — no real auth, just navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/50">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
            AG
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ag-starter</h1>
          <p className="text-muted-foreground">
            Multi-tenant FinOps platform with agentic AI
          </p>
        </div>

        {/* Login card */}
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Enter your tenant ID to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant ID</Label>
                <Input
                  id="tenant"
                  placeholder="tenant-demo-001"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="operator@acme.com"
                  defaultValue="operator@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  defaultValue="password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign in to Dashboard
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          This is a demo starter — no real authentication is configured.
        </p>
      </div>
    </div>
  );
}
