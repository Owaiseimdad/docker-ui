interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ActionButton({
  children,
  onClick,
  variant,
  disabled = false,
  size = 'md'
}: ActionButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-orange-600 text-white hover:bg-orange-700"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}