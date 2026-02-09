import { useState, useEffect } from 'react';

interface HeartbeatIndicatorProps {
  status: 'online' | 'busy' | 'idle' | 'offline';
  activity?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showActivity?: boolean;
  pulse?: boolean;
}

const statusConfig = {
  online: {
    color: 'bg-emerald-500',
    ringColor: 'ring-emerald-500/30',
    label: 'Online',
    icon: '●',
  },
  busy: {
    color: 'bg-amber-500',
    ringColor: 'ring-amber-500/30',
    label: 'Busy',
    icon: '◐',
  },
  idle: {
    color: 'bg-zinc-500',
    ringColor: 'ring-zinc-500/30',
    label: 'Idle',
    icon: '○',
  },
  offline: {
    color: 'bg-zinc-700',
    ringColor: 'ring-zinc-700/30',
    label: 'Offline',
    icon: '○',
  },
};

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    text: 'text-xs',
    ring: 'ring-2',
  },
  md: {
    dot: 'w-3 h-3',
    text: 'text-sm',
    ring: 'ring-2',
  },
  lg: {
    dot: 'w-4 h-4',
    text: 'text-base',
    ring: 'ring-4',
  },
};

export default function HeartbeatIndicator({
  status,
  activity,
  size = 'md',
  showLabel = false,
  showActivity = false,
  pulse = true,
}: HeartbeatIndicatorProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  useEffect(() => {
    if (pulse && status === 'online') {
      const interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 1000);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [pulse, status]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {/* Pulse ring */}
        {isPulsing && status === 'online' && (
          <div
            className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`}
          />
        )}
        {/* Status dot */}
        <div
          className={`
            ${sizeStyles.dot}
            ${config.color}
            rounded-full
            ${status !== 'offline' ? sizeStyles.ring : ''}
            ${config.ringColor}
            transition-all duration-300
          `}
        />
      </div>

      {(showLabel || showActivity) && (
        <div className="flex flex-col">
          {showLabel && (
            <span className={`${sizeStyles.text} text-zinc-400 font-medium`}>
              {config.label}
            </span>
          )}
          {showActivity && activity && (
            <span className={`${sizeStyles.text} text-zinc-500 truncate max-w-[200px]`}>
              {activity}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
