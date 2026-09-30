import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IntentDialProps {
  score: number;
  size?: 'sm' | 'default' | 'lg';
}

export function IntentDial({ score, size = 'default' }: IntentDialProps) {
  const sizeMap = {
    sm: 64,
    default: 80,
    lg: 100
  };
  
  const dim = sizeMap[size];
  const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = 'text-tertiary';
  if (score >= 80) colorClass = 'text-accent';
  else if (score >= 50) colorClass = 'text-accent-light';

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: dim, height: dim }}
      aria-label={`Intent score: ${score}`}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${dim} ${dim}`}>
        {/* Background circle */}
        <circle
          className="text-surface-sub stroke-current opacity-50"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={dim / 2}
          cy={dim / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className={cn("stroke-current", colorClass)}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={dim / 2}
          cy={dim / 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.8 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn(
          "font-display font-medium",
          size === 'sm' ? "text-lg" : size === 'lg' ? "text-3xl" : "text-2xl",
          colorClass
        )}>
          {score}
        </span>
      </div>
    </div>
  );
}
