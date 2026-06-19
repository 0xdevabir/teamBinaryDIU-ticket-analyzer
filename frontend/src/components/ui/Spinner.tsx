export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      {label && <p className="mt-4 text-sm text-neutral-500">{label}</p>}
    </div>
  );
}
