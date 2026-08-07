import { useRef } from 'react';
import RichTextToolbar from './RichTextToolbar';

interface CustomSectionFormProps {
  title: string;
  body: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  titlePlaceholder?: string;
  saving?: boolean;
}

// Shared add/edit form for admin-added custom items (sidebar pages, About
// sections, Help sections) — all the same shape, a title plus a rich-text
// body (see RichTextToolbar / utils/richText.ts).
export default function CustomSectionForm({
  title, body, onTitleChange, onBodyChange, onSave, onCancel, titlePlaceholder, saving,
}: CustomSectionFormProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="app-card app-card-pad" style={{ marginTop: 8, border: '1px solid var(--violet)' }}>
      <div className="app-field">
        <label>Title</label>
        <input className="app-input" value={title} onChange={e => onTitleChange(e.target.value)} placeholder={titlePlaceholder || 'Title'} />
      </div>
      <div className="app-field">
        <label>Content</label>
        <RichTextToolbar textareaRef={bodyRef} onChange={onBodyChange} />
        <textarea ref={bodyRef} className="app-textarea" value={body} onChange={e => onBodyChange(e.target.value)} style={{ minHeight: 100 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="button" className="app-btn app-btn-primary app-btn-sm" onClick={onSave} disabled={saving || !title.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
