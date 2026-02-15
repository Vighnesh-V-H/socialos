import { authClient } from "@/lib/auth-client";

export const linkedinConnctionHandler = async () => {
  const result = await authClient.linkSocial({
    provider: "linkedin",
    callbackURL: "/connections",
    scopes: ["w_member_social"],
  });

  if (result?.error) {
    throw new Error(result.error.message || "LinkedIn connection failed");
  }

  if (result?.data?.url) {
    window.location.assign(result.data.url);
  }
};
