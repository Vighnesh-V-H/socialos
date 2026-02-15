import { type LucideIcon } from "lucide-react";

export type connection = {
  name: string;
  icon: LucideIcon;
  handler: () => void | Promise<void>;
};
