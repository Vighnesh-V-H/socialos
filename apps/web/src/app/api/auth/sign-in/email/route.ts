import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
      rememberMe: true,
      callbackURL: "http://localhost:3000/projects",
    },
    headers: await headers(),
  });

  return NextResponse.json(data);
}
