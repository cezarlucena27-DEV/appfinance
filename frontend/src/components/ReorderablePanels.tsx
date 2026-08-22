import { useEffect, useState } from 'react';

interface ReorderablePanelsProps {
  storageKey: string;
  className?: string;
  children: React.ReactNode[];
}

export function ReorderablePanels({ storageKey, className = 'space-y-6', children }: ReorderablePanelsProps) {
  const [order, setOrder] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('financeapp_panels_' + storageKey);
      if (stored) {
        const arr = JSON.parse(stored);
        if (
          Array.isArray(arr) &&
          arr.length === children.length &&
          arr.every((n) => Number.isInteger(n) && n >= 0 && n < children.length) &&
          new Set(arr).size === arr.length
        ) {
          return arr;
        }
      }
    } catch {}
    return children.map((_, i) => i);
  });

  useEffect(() => {
    setOrder((prev) => {
      if (prev.length === children.length) return prev;
      return children.map((_, i) => i);
    });
  }, [children.length]);

  const [dragging, setDragging] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      try {
        localStorage.setItem('financeapp_panels_' + storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className={className}>
      {order.map((childIndex, position) => (
        <div
          key={childIndex}
          draggable
          onDragStart={(e) => {
            setDragging(position);
            setOverIndex(null);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(position));
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (dragging !== null && overIndex !== position) setOverIndex(position);
          }}
          onDragLeave={(e) => {
            if (overIndex === position && !e.currentTarget.contains(e.relatedTarget as Node)) {
              setOverIndex(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            const from = dragging ?? Number(e.dataTransfer.getData('text/plain') || position);
            move(from, position);
            setDragging(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragging(null);
            setOverIndex(null);
          }}
          className={`cursor-grab active:cursor-grabbing select-none transition-opacity ${
            dragging === position ? 'opacity-40' : ''
          } ${
            overIndex === position && dragging !== null
              ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 rounded-2xl'
              : ''
          }`}
        >
          {children[childIndex]}
        </div>
      ))}
    </div>
  );
}