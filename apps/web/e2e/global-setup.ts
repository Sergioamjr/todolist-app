import { request } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL ?? 'test@example.com';
const PASSWORD = process.env.E2E_PASSWORD ?? 'password123';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default async function globalSetup() {
  const ctx = await request.newContext();
  await ctx.post(`${API_URL}/api/auth/sign-up/email`, {
    data: { email: EMAIL, password: PASSWORD, name: 'Test User' },
  });
  await ctx.dispose();
}
