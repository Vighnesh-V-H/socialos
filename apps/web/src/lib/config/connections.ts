import type { connection } from "@/types";
import { linkedinConnctionHandler } from "../connections/handler";
import { LinkedInIcon } from "@/components/icons";

export const connections: connection[] = [
  {
    name: "linkedin",
    icon: LinkedInIcon,
    handler: linkedinConnctionHandler,
  },
];
