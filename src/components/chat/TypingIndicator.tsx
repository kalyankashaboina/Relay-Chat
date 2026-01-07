import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  userNames: string[];
  className?: string;
  translate: (key: string) => string;
  showInline?: boolean;
}

export function TypingIndicator({ userNames, className, translate, showInline = false }: TypingIndicatorProps) {
  if (userNames.length === 0) return null;

  const displayText = userNames.length === 1
    ? `${userNames[0]} ${translate('typing.indicator')}`
    : userNames.length === 2
    ? `${userNames[0]} and ${userNames[1]} ${translate('typing.multiple')}`
    : `${userNames[0]} and ${userNames.length - 1} others ${translate('typing.multiple')}`;

  // Inline version for conversation list
  if (showInline) {
    return (
      <span className="text-primary text-xs font-medium flex items-center gap-1">
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 w-1 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </span>
        <span className="truncate">{displayText}</span>
      </span>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn('flex items-center gap-2', className)}
      >
        <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3 shadow-sm">
          {/* Animated dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-muted-foreground"
                animate={{ 
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* User avatars for multiple users */}
          {userNames.length > 1 && (
            <div className="flex -space-x-2 ml-1">
              {userNames.slice(0, 3).map((name, i) => (
                <div 
                  key={i}
                  className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-card"
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <motion.span 
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {displayText}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact typing indicator for headers
export function TypingIndicatorCompact({ userNames, translate }: { userNames: string[], translate: (key: string) => string }) {
  if (userNames.length === 0) return null;

  return (
    <span className="text-primary text-xs flex items-center gap-1">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </span>
      {userNames.length === 1 
        ? `${userNames[0]} ${translate('typing.indicator')}`
        : `${userNames.length} people ${translate('typing.multiple')}`}
    </span>
  );
}
