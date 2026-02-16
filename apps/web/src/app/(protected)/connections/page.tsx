"use client";

import ConnectionCard from "@/components/connections/connection-card";
import { authClient } from "@/lib/auth-client";
import { connections } from "@/lib/config/connections";
import { useEffect, useMemo, useState } from "react";

type LinkedAccount = {
  provider?: string;
  providerId?: string;
};

function Connections() {
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);

  useEffect(() => {
    const loadLinkedAccounts = async () => {
      const result = (await authClient.listAccounts()) as unknown;
      const payload = result as {
        data?: LinkedAccount[] | { accounts?: LinkedAccount[] };
      };

      const accounts = Array.isArray(result)
        ? result
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.data?.accounts)
            ? payload.data.accounts
            : [];

      const providers = accounts
        .map((account: LinkedAccount) => {
          const provider = account.providerId ?? account.provider;
          return typeof provider === "string" ? provider.toLowerCase() : "";
        })
        .filter(Boolean);

      setLinkedProviders(providers);
    };

    void loadLinkedAccounts();
  }, []);

  const linkedProviderSet = useMemo(
    () => new Set(linkedProviders),
    [linkedProviders],
  );

  return (
    <div className='space-y-3 w-3/4  m-auto'>
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.name}
          connection={connection}
          connected={linkedProviderSet.has(connection.name.toLowerCase())}
          manageHref={`/connection/${connection.name}`}
        />
      ))}
    </div>
  );
}

export default Connections;
