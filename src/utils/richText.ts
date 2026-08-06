// A tiny, safe subset of markdown used for Guide section bodies —
// **bold**, *italic*, __underline__, "## " sub-headings, "- " bullet lists.
// Not a general markdown parser: just enough for the admin toolbar in
// AdminGuides.tsx to write, and renderSectionBody() below to display.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineFormat(escaped: string): string {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Input is raw user text (never trusted) — every piece of it is escaped
// before any of our own tags are added, so the output is always safe to
// render with dangerouslySetInnerHTML.
export function renderSectionBody(text: string): string {
  const lines = text.split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(`<p class="app-section-p">${paragraph.map(l => inlineFormat(escapeHtml(l))).join('<br>')}</p>`);
    paragraph = [];
  }
  function flushList() {
    if (list.length === 0) return;
    blocks.push(`<ul class="app-section-list">${list.map(l => `<li>${inlineFormat(escapeHtml(l))}</li>`).join('')}</ul>`);
    list = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flushParagraph(); flushList();
      blocks.push(`<h4 class="app-section-subheading">${inlineFormat(escapeHtml(trimmed.slice(3)))}</h4>`);
    } else if (trimmed.startsWith('- ')) {
      flushParagraph();
      list.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushParagraph(); flushList();
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return blocks.join('');
}

interface TextEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

// Wraps the current selection in `before`/`after` (e.g. ** **) — if nothing
// is selected, inserts an empty pair with the cursor placed between them.
export function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string = before): TextEdit {
  const { value, selectionStart, selectionEnd } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  const newStart = selectionStart + before.length;
  return { value: next, selectionStart: newStart, selectionEnd: newStart + selected.length };
}

// Prefixes every line touched by the current selection with `prefix` (e.g.
// "- " or "## "), skipping lines that already have it.
export function prefixLines(textarea: HTMLTextAreaElement, prefix: string): TextEdit {
  const { value, selectionStart, selectionEnd } = textarea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const nextBreak = value.indexOf('\n', selectionEnd);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(lineStart, lineEnd);
  const prefixed = block.split('\n').map(l => l.startsWith(prefix) ? l : prefix + l).join('\n');
  const next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  return { value: next, selectionStart: lineStart, selectionEnd: lineStart + prefixed.length };
}
