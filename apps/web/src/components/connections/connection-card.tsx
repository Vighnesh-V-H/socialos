"use client";

import type { connection } from "@/types";
import { Check } from "lucide-react";
import { useState } from "react";

type ConnectionCardProps = {
  connection: connection;
  connected?: boolean;
};

export default function ConnectionCard({
  connection,
  connected = false,
}: ConnectionCardProps) {
  const [isConnected, setIsConnected] = useState(connected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError("");
      await connection.handler();
      if (!connected) {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='rounded-md border p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <connection.icon size={18} />
          <span className='capitalize'>{connection.name}</span>
        </div>

        {isConnected ? (
          <div className='flex items-center gap-1 text-green-600'>
            <Check size={16} />
            <span>Connected</span>
          </div>
        ) : (
          <button
            type='button'
            onClick={handleConnect}
            disabled={isLoading}
            className='rounded-md border px-3 py-1 text-sm'>
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>

      {error ? <p className='mt-2 text-sm text-red-500'>{error}</p> : null}
    </div>
  );
}
