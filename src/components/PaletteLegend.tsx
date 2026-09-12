import React from 'react';

export const PaletteLegend: React.FC<{
  counts?: {
    answered: number;
    notAnswered: number;
    notVisited: number;
    marked: number;
    answeredAndMarked: number;
  };
}> = ({ counts }) => {
  const items = [
    {
      label: 'Answered',
      dotClass: 'bg-[var(--signal-correct)]',
      count: counts?.answered,
    },
    {
      label: 'Not Answered',
      dotClass: 'bg-[var(--signal-wrong)]',
      count: counts?.notAnswered,
    },
    {
      label: 'Not Visited',
      dotClass: 'bg-[var(--line)] border border-[var(--ink)] opacity-60',
      count: counts?.notVisited,
    },
    {
      label: 'Marked for Review',
      dotClass: 'bg-[var(--signal-review)]',
      count: counts?.marked,
    },
    {
      label: 'Answered & Marked',
      dotClass: 'bg-[var(--signal-review)] ring-2 ring-offset-1 ring-[var(--signal-review)]',
      count: counts?.answeredAndMarked,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-[var(--ink)]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full flex-shrink-0 ${item.dotClass}`} />
          <span className="truncate opacity-90">{item.label}</span>
          {item.count !== undefined && (
            <span className="ml-auto font-mono text-[11px] font-semibold opacity-75">
              {item.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
