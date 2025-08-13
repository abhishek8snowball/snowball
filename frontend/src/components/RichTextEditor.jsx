import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

const RichTextEditor = ({ content, onSave, onCancel, isOpen }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc pl-5 space-y-1',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal pl-5 space-y-1',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'leading-relaxed',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 hover:text-blue-800 underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 font-semibold text-left p-2 border border-gray-300',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: { class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4' },
    },
    onUpdate: ({ editor }) => {
      // Auto-save content as user types (optional)
      // console.log('Content updated:', editor.getHTML());
    },
  });

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const convertPlainTextToMarkdown = () => {
    if (!editor) return;
    
    const currentContent = editor.getText();
    if (!currentContent.trim()) return;
    
    // Convert plain text to basic Markdown
    let markdownContent = currentContent;
    
    // Convert double line breaks to paragraphs
    markdownContent = markdownContent.replace(/\n\n+/g, '\n\n');
    
    // Convert lines that look like headings
    markdownContent = markdownContent.replace(/^([A-Z][^.!?]*?)(?:\n|$)/gm, '## $1\n');
    
    // Convert lines starting with numbers to ordered lists
    markdownContent = markdownContent.replace(/^(\d+\.\s+)(.+)$/gm, '$1$2');
    
    // Convert lines starting with - or * to unordered lists
    markdownContent = markdownContent.replace(/^([-*]\s+)(.+)$/gm, '$1$2');
    
    // Convert bold patterns (text between ** or __)
    markdownContent = markdownContent.replace(/\*\*(.*?)\*\*/g, '**$1**');
    markdownContent = markdownContent.replace(/__(.*?)__/g, '**$1**');
    
    // Convert italic patterns (text between * or _)
    markdownContent = markdownContent.replace(/\*(.*?)\*/g, '*$1*');
    markdownContent = markdownContent.replace(/_(.*?)_/g, '*$1*');
    
    // Set the converted content
    editor.commands.setContent(markdownContent);
  };

  // Table functions
  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addColumnBefore = () => {
    editor?.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor?.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Blog Content</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(editor?.getHTML())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 bg-gray-50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              H1
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              H2
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              H3
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded ${editor?.isActive('underline') ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              title="Underline"
            >
              <u>U</u>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={`p-2 rounded ${editor?.isActive('code') ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              title="Inline Code"
            >
              &lt;/&gt;
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-blue-200 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              title="Numbered List"
            >
              1.
            </button>
            <button
              onClick={addLink}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
            >
              🔗
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
            >
              🖼️
            </button>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Table Controls */}
            <button
              onClick={insertTable}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Insert Table"
            >
              📊
            </button>
            <button
              onClick={addColumnBefore}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Add Column Before"
            >
              ➕
            </button>
            <button
              onClick={addColumnAfter}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Add Column After"
            >
              ➕
            </button>
            <button
              onClick={deleteColumn}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Delete Column"
            >
              ➖
            </button>
            <button
              onClick={addRowBefore}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Add Row Before"
            >
              ➕
            </button>
            <button
              onClick={addRowAfter}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Add Row After"
            >
              ➕
            </button>
            <button
              onClick={deleteRow}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Delete Row"
            >
              ➖
            </button>
            <button
              onClick={deleteTable}
              className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
              title="Delete Table"
            >
              🗑️
            </button>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Convert to Markdown */}
            <button
              onClick={convertPlainTextToMarkdown}
              className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Convert plain text to Markdown"
            >
              📝
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          <EditorContent editor={editor} className="min-h-[400px]" />
        </div>

        {/* Footer with Help */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>💡 Use the toolbar above or keyboard shortcuts</span>
            <div className="flex space-x-4 text-xs">
              <span><strong>Ctrl+B:</strong> Bold</span>
              <span><strong>Ctrl+I:</strong> Italic</span>
              <span><strong>Ctrl+U:</strong> Underline</span>
              <span><strong>Ctrl+K:</strong> Link</span>
              <span><strong>Ctrl+Shift+1:</strong> H1</span>
              <span><strong>Ctrl+Shift+2:</strong> H2</span>
              <span><strong>Ctrl+Shift+3:</strong> H3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
