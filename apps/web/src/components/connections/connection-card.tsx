"use client";

import type { connection } from "@/types";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

type ConnectionCardProps = {
  connection: connection;
  connected?: boolean;
  manageHref?: string;
};

export default function ConnectionCard({
  connection,
  connected = false,
  manageHref,
}: ConnectionCardProps) {
  const [isConnected, setIsConnected] = useState(connected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError("");
      await connection.handler();
      if (!connected) {
        setIsConnected(true);
      }
    } catch (err) {
      setIsConnected(false);
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='rounded-md w-full m-auto border dark:bg-[#1b1b1d] p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <connection.icon />
          <span className='capitalize'>{connection.name}</span>
        </div>

        {isConnected ? (
          <div className='flex  items-center gap-2'>
            <div className='flex items-center gap-1 text-green-600'>
              <Check size={16} />
              <span className='md:flex hidden '>Connected</span>
            </div>
            {manageHref ? (
              <Button
                asChild
                variant='outline'
                size='sm'
                className='rounded-md hover:dark:bg-[#272728] dark:bg-[#242426] text-[#313131] dark:text-[#d3d3d3] border px-3 py-1 text-sm'>
                <Link href={manageHref}>Manage</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <Button
            type='button'
            onClick={handleConnect}
            disabled={isLoading}
            className='rounded-md hover:dark:bg-[#272728] dark:bg-[#242426] text-[#d3d3d3] border px-3 py-1 text-sm'>
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>

      {error ? <p className='mt-2 text-sm text-red-500'>{error}</p> : null}
    </div>
  );
}
