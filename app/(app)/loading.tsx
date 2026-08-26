export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 h-9 w-32 animate-pulse rounded-input bg-paper-3" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-tile bg-paper-3"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
