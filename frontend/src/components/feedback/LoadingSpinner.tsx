export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
      <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
    </div>
  </div>
);