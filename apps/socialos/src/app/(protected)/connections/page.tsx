"use client";

import ConnectionCard from "@/components/connections/connection-card";
import { connections } from "@/lib/config/connections";
import { toast } from "sonner";

function Connections() {
  return (
    <div className='space-y-3'>
      {connections.map((connection) => (
        <ConnectionCard key={connection.name} connection={connection} />
      ))}
    </div>
  );
}

export default Connections;
