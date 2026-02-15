import { Loader2 } from "lucide-react";

type LoaderProps = {
  variant?: "fullscreen" | "inline";
};

export default function Loader({ variant = "fullscreen" }: LoaderProps) {
  if (variant === "inline") {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-background z-50'>
      <Loader2 className='w-12 h-12 animate-spin text-primary' />
    </div>
  );
}
