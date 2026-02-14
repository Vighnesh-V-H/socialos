"use client";
import Loader from "@/components/loader";
import { useSession } from "@/lib/session";

function Projects() {
  const { user, isPending } = useSession();

  if (isPending) {
    return <Loader />;
  }

  if (!user || !user.emailVerified) {
    return <div>not verified</div>;
  }

  return <div>Projects</div>;
}

export default Projects;
