import { NextRequest, NextResponse } from "next/server";

const CONNECTED_ERROR_PATH = "/connections";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const redirectUrl = new URL(CONNECTED_ERROR_PATH, origin);

  if (error) {
    redirectUrl.searchParams.set("error", error);
  }

  if (errorDescription) {
    redirectUrl.searchParams.set("error_description", errorDescription);
  }

  return NextResponse.redirect(redirectUrl);
}
