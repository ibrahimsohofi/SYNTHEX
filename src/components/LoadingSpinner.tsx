interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-teal-500/20 border-t-teal-500 animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-transparent border-t-teal-400/30 animate-spin`}
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
      </div>
      {text && (
        <p className="text-sm text-zinc-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
