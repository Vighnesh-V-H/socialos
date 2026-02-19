import LinkedInPostEditor from "@/components/connections/linkedin-post-editor";

type ConnectionNamePageProps = {
  params: Promise<{
    name: string;
  }>;
};

async function ConnectionName({ params }: ConnectionNamePageProps) {
  const { name } = await params;
  const connectionName = name.toLowerCase();

  if (connectionName === "linkedin") {
    return (
      <div className='mx-auto w-full max-w-4xl'>
        <LinkedInPostEditor />
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-3xl rounded-xl border bg-card p-6 text-card-foreground'>
      <h1 className='text-lg font-semibold capitalize'>{connectionName}</h1>
      <p className='text-muted-foreground mt-2 text-sm'>
        Post composer is currently available for LinkedIn only.
      </p>
    </div>
  );
}

export default ConnectionName;
