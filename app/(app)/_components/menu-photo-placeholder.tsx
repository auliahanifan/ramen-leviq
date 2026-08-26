export function MenuPhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-paper-3 text-muted ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-1/2 w-1/2"
      >
        <path d="M8 12V7a4 4 0 0 1 8 0v5" />
        <path d="M4 12h16a1 1 0 0 1 1 1 8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8 1 1 0 0 1 1-1Z" />
      </svg>
    </div>
  );
}
