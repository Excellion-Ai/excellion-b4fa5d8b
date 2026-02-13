import { Pencil } from 'lucide-react';

interface EditableOverlayProps {
  children: React.ReactNode;
  isEditMode: boolean;
  label?: string;
  onEdit: () => void;
}

export function EditableOverlay({ children, isEditMode, label, onEdit }: EditableOverlayProps) {
  if (!isEditMode) return <>{children}</>;

  return (
    <div className="relative group/editable cursor-pointer" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
      {children}
      <div className="absolute inset-0 border-2 border-transparent group-hover/editable:border-amber-500/60 group-hover/editable:bg-amber-500/5 transition-all pointer-events-none rounded" />
      <div className="absolute top-1 right-1 opacity-0 group-hover/editable:opacity-100 transition-opacity z-10 pointer-events-none">
        <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
          <Pencil className="w-2.5 h-2.5" />
          {label || 'Edit'}
        </span>
      </div>
    </div>
  );
}
