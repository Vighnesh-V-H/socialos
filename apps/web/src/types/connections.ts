import React from "react";

export type connection = {
  name: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  handler: () => void | Promise<void>;
};
