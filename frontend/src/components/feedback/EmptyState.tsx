interface EmptyStateProps {
    title: string;
    description: string;
    action?: React.ReactNode;
  }
  
  export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );