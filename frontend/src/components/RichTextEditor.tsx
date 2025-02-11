import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react';  
import { cn } from '../lib/utils';
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface ToolbarButtonProps {
  isActive?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const ToolbarButton = ({ isActive, onClick, icon, label, disabled }: ToolbarButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-8 w-8 p-0',
      isActive && 'bg-muted',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
    title={label}
  >
    {icon}
  </Button>
);

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const tools = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      isActive: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
      disabled: !editor.can().chain().focus().toggleBold().run(),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      isActive: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: <List className="h-4 w-4" />,
      label: 'Bullet List',
      isActive: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: 'Numbered List',
      isActive: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: <Undo className="h-4 w-4" />,
      label: 'Undo',
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().chain().focus().undo().run(),
    },
    {
      icon: <Redo className="h-4 w-4" />,
      label: 'Redo',
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div className="border-b p-1 flex flex-wrap items-center gap-1">
      {tools.map((tool, index) => (
        tool.type === 'divider' ? (
          <div key={index} className="w-[1px] h-6 bg-border mx-1" />
        ) : (
          <ToolbarButton
            key={tool.label}
            isActive={tool.isActive}
            onClick={tool.onClick as () => void}
            icon={tool.icon}
            label={tool.label || ''}
            disabled={tool.disabled}
          />
        )
      ))}
    </div>
  );
};

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
          'min-h-[200px] px-3 py-2',
          className
        ),
      },
    },
  });

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}