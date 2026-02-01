import { ImpactTag as ImpactTagType, IMPACT_TAG_CONFIG } from '@/types/impact';
import { cn } from '@/lib/utils';

interface ImpactTagProps {
  tag: ImpactTagType;
  size?: 'sm' | 'md';
  onClick?: () => void;
  selected?: boolean;
}

export function ImpactTag({ tag, size = 'sm', onClick, selected }: ImpactTagProps) {
  const config = IMPACT_TAG_CONFIG[tag];
  
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center font-medium border rounded-full transition-all duration-200',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.color,
        onClick && 'cursor-pointer hover:scale-105',
        selected && 'ring-2 ring-accent ring-offset-1'
      )}
    >
      {config.label}
    </span>
  );
}
