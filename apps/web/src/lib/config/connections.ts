import type { connection } from "@/types";
import { linkedinConnctionHandler } from "../connections/handler";
import { Linkedin } from "lucide-react";

export const connections: connection[] = [
  {
    name: "linkedin",
    icon: Linkedin,
    handler: linkedinConnctionHandler,
  },
];
