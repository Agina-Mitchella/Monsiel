import React from 'react';
import { CalendarHeart, UtensilsCrossed, BookOpen, Library } from 'lucide-react';

interface ShortcutsBarProps {
  onSelectShortcut: (text: string) => void;
  disabled?: boolean;
}

export const ShortcutsBar: React.FC<ShortcutsBarProps> = ({ onSelectShortcut, disabled = false }) => {
  const shortcuts = [
    {
      label: 'Check in',
      prompt: 'Check in',
      icon: <CalendarHeart className="w-3.5 h-3.5 text-[#E26D5C]" />,
      hint: 'Log daily rhythm and feelings'
    },
    {
      label: 'Food ideas',
      prompt: 'Food ideas',
      icon: <UtensilsCrossed className="w-3.5 h-3.5 text-[#3E8E62]" />,
      hint: 'Browse catalogue & recipes'
    },
    {
      label: 'My journal',
      prompt: 'My journal',
      icon: <BookOpen className="w-3.5 h-3.5 text-[#B83A68]" />,
      hint: 'Revisit private reflections'
    },
    {
      label: 'Library',
      prompt: 'Library',
      icon: <Library className="w-3.5 h-3.5 text-[#133E48]" />,
      hint: 'Read expert-reviewed articles'
    }
  ];

  return (
    <div
      aria-label="Conversation shortcuts"
      className="flex flex-wrap gap-2 px-4 py-2 bg-[#FAF7F2] border-b border-[#EFE8DC]"
    >
      {shortcuts.map((sc) => (
        <button
          key={sc.label}
          onClick={() => onSelectShortcut(sc.prompt)}
          disabled={disabled}
          title={sc.hint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#133E48] bg-[#F3ECE1] hover:bg-[#E9DECة] hover:shadow-sm border border-[#E5DACD] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#133E48] focus:ring-offset-1"
        >
          {sc.icon}
          <span>{sc.label}</span>
        </button>
      ))}
    </div>
  );
};
