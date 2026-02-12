import { ChevronUp, ChevronDown, Pencil, X } from 'lucide-react';

interface SectionWrapperProps {
  type: string;
  children: React.ReactNode;
  isEditMode: boolean;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}

export function SectionWrapper({
  type,
  children,
  isEditMode,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SectionWrapperProps) {
  if (!isEditMode) return <>{children}</>;

  return (
    <div className="relative group">
      {children}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-500 transition pointer-events-none rounded-lg" />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
        <button
          onClick={onEdit}
          className="bg-amber-500 text-black p-2 rounded-lg text-xs font-medium hover:bg-amber-400 pointer-events-auto"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={onMoveUp}
          className="bg-zinc-700 text-white p-2 rounded-lg hover:bg-zinc-600 pointer-events-auto"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          onClick={onMoveDown}
          className="bg-zinc-700 text-white p-2 rounded-lg hover:bg-zinc-600 pointer-events-auto"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          onClick={onRemove}
          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 pointer-events-auto"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition z-10">
        <span className="bg-zinc-800/90 text-amber-400 text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wide pointer-events-auto">
          {type}
        </span>
      </div>
    </div>
  );
}
