"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  collegeCode: z.string().optional()
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", collegeCode: "" } });

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    try {
      const response = await apiRequest<{ accessToken: string }>("/auth/login", { method: "POST", body: JSON.stringify(values) });
      window.localStorage.setItem("accessToken", response.data.accessToken);
      router.push("/dashboard");
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap size={24} />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted-foreground">Use your college account</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Input placeholder="College code" {...form.register("collegeCode")} />
          <Input placeholder="Email" type="email" {...form.register("email")} />
          <Input placeholder="Password" type="password" {...form.register("password")} />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
