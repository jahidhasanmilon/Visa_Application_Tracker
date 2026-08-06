import type { RefObject } from 'react';
import { Bold, Italic, Underline, List, Heading } from 'lucide-react';
import { wrapSelection, prefixLines, type TextEdit } from '../utils/richText';

interface RichTextToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

// Same bold/italic/underline/bullet-list/sub-heading toolbar used for Guide
// sections (see admin/Guides.tsx), factored out for single-textarea use
// (Privacy/Terms tabs, Help notes) — writes the same lightweight markup
// that utils/richText.ts's renderSectionBody() knows how to render.
export default function RichTextToolbar({ textareaRef, onChange }: RichTextToolbarProps) {
  function apply(action: (ta: HTMLTextAreaElement) => TextEdit) {
    const ta = textareaRef.current;
    if (!ta) return;
    const result = action(ta);
    onChange(result.value);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
      <button type="button" className="app-icon-btn" title="Bold" aria-label="Bold" onClick={() => apply(ta => wrapSelection(ta, '**'))}>
        <Bold size={14} />
      </button>
      <button type="button" className="app-icon-btn" title="Italic" aria-label="Italic" onClick={() => apply(ta => wrapSelection(ta, '*'))}>
        <Italic size={14} />
      </button>
      <button type="button" className="app-icon-btn" title="Underline" aria-label="Underline" onClick={() => apply(ta => wrapSelection(ta, '__'))}>
        <Underline size={14} />
      </button>
      <button type="button" className="app-icon-btn" title="Bullet list" aria-label="Bullet list" onClick={() => apply(ta => prefixLines(ta, '- '))}>
        <List size={14} />
      </button>
      <button type="button" className="app-icon-btn" title="Sub-heading" aria-label="Sub-heading" onClick={() => apply(ta => prefixLines(ta, '## '))}>
        <Heading size={14} />
      </button>
    </div>
  );
}
