"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Anchor } from "@mantine/core";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppLayout from "@/components/AppLayout";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  function toggleMode() {
    reset();
    setMode((m) => (m === "signin" ? "signup" : "signin"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signin") {
      await authClient.signIn.email(
        { email, password, callbackURL: "/" },
        {
          onSuccess: () => router.push("/"),
          onError: (ctx) => setError(ctx.error.message),
        },
      );
    } else {
      await authClient.signUp.email(
        { email, password, name, callbackURL: "/" },
        {
          onSuccess: () => router.push("/"),
          onError: (ctx) => setError(ctx.error.message),
        },
      );
    }

    setLoading(false);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-center py-16">
        <Paper shadow="sm" p="xl" radius="md" w={360}>
          <Title order={3} mb="xs">
            {mode === "signin" ? "Sign in" : "Create account"}
          </Title>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <TextInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                mb="sm"
              />
            )}
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              mb="sm"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              mb="md"
            />
            {error && (
              <Text c="red" size="sm" mb="sm">
                {error}
              </Text>
            )}
            <Button type="submit" fullWidth loading={loading} mb="sm">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <Text size="sm" ta="center" c="dimmed">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <Anchor size="sm" onClick={toggleMode} style={{ cursor: "pointer" }}>
              {mode === "signin" ? "Create account" : "Sign in"}
            </Anchor>
          </Text>
        </Paper>
      </div>
    </AppLayout>
  );
}
