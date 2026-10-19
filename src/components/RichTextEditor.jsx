import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

function ToolbarButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium ${active ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300' : 'text-muted-foreground hover:bg-muted'}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, contentKey, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Write your LinkedIn post…' }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML(), ed.getText()),
  });

  useEffect(() => {
    if (!editor || contentKey == null) return;
    editor.commands.setContent(value || '');
  }, [contentKey, editor]);

  if (!editor) return null;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbered
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Link URL');
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
