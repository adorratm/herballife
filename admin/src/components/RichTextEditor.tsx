'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { uploadMedia } from '@/lib/api';
import { MediaLibraryPicker } from '@/components/MediaLibraryPicker';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
};

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-surface-high text-foreground hover:bg-border-muted'
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'İçerik yazın…',
  minHeight = '320px',
  className = '',
}: RichTextEditorProps) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const applyingExternal = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // TipTap v3 StarterKit zaten link + underline içerir; ayrı eklemeyin (duplicate uyarısı)
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: {},
        codeBlock: {},
        horizontalRule: {},
        strike: {},
        underline: {},
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none px-3 py-3 min-h-[16rem]',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (applyingExternal.current) return;
      const html = ed.getHTML();
      // TipTap boş içeriği <p></p> yapar
      onChangeRef.current(
        html === '<p></p>' || html === '<p><br></p>' ? '' : html,
      );
    },
  });

  useEffect(() => {
    if (!editor || htmlMode) return;
    const current = editor.getHTML();
    const incoming = value || '';
    const same =
      current === incoming ||
      (incoming === '' &&
        (current === '<p></p>' || current === '<p><br></p>' || editor.isEmpty));
    if (same) return;
    applyingExternal.current = true;
    editor.commands.setContent(incoming, { emitUpdate: false });
    applyingExternal.current = false;
  }, [value, editor, htmlMode]);

  useEffect(() => {
    if (htmlMode) setHtmlDraft(value);
  }, [htmlMode, value]);

  useEffect(() => {
    if (!imageMenuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!imageMenuRef.current?.contains(e.target as Node)) {
        setImageMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [imageMenuOpen]);

  const insertImageUrl = useCallback(
    (url: string) => {
      if (!editor || !url.trim()) return;
      editor.chain().focus().setImage({ src: url.trim() }).run();
      setImageMenuOpen(false);
    },
    [editor],
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Bağlantı URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImageFromPrompt = useCallback(() => {
    const url = window.prompt('Görsel URL');
    if (url?.trim()) insertImageUrl(url);
  }, [insertImageUrl]);

  async function onImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    setUploadingImage(true);
    try {
      const asset = await uploadMedia(file, { folder: 'editor' });
      insertImageUrl(asset.url);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Görsel yüklenemedi',
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function toggleHtmlMode() {
    if (htmlMode && editor) {
      editor.commands.setContent(htmlDraft || '', { emitUpdate: false });
      onChange(htmlDraft);
    }
    setHtmlMode((m) => !m);
  }

  if (htmlMode) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex flex-wrap gap-1 rounded-t-lg border border-border-muted bg-surface p-2">
          <ToolbarButton onClick={toggleHtmlMode} title="Görsel düzenleyici">
            Görsel
          </ToolbarButton>
        </div>
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value);
            onChange(e.target.value);
          }}
          style={{ minHeight }}
          className="w-full rounded-b-lg border border-border-muted bg-background px-3 py-2 font-mono text-sm"
        />
      </div>
    );
  }

  if (!editor) {
    return (
      <div
        className={`animate-pulse rounded-lg border border-border-muted bg-surface-high ${className}`}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border-muted ${className}`}
    >
      <div className="flex flex-wrap gap-1 border-b border-border-muted bg-surface p-2">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Kalın"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="İtalik"
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Altı çizili"
        >
          U
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Üstü çizili"
        >
          S
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-border-muted" />
        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Başlık 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Başlık 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Başlık 3"
        >
          H3
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-border-muted" />
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Alıntı"
        >
          “
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Kod bloğu"
        >
          {'</>'}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Yatay çizgi"
        >
          ―
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-border-muted" />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Madde işaretli liste"
        >
          • Liste
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numaralı liste"
        >
          1. Liste
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-border-muted" />
        <ToolbarButton
          onClick={setLink}
          title="Bağlantı"
          active={editor.isActive('link')}
        >
          Link
        </ToolbarButton>
        <div className="relative" ref={imageMenuRef}>
          <ToolbarButton
            onClick={() => setImageMenuOpen((v) => !v)}
            title="Görsel ekle"
          >
            Görsel ▾
          </ToolbarButton>
          {imageMenuOpen ? (
            <div className="absolute left-0 top-full z-20 mt-1 min-w-40 rounded border border-border-muted bg-background py-1 shadow-lg">
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-surface-high"
                onClick={() => {
                  setImageMenuOpen(false);
                  addImageFromPrompt();
                }}
              >
                URL ile ekle
              </button>
              <button
                type="button"
                disabled={uploadingImage}
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-surface-high disabled:opacity-50"
                onClick={() => {
                  setImageMenuOpen(false);
                  fileInputRef.current?.click();
                }}
              >
                {uploadingImage ? 'Yükleniyor…' : 'Dosya yükle'}
              </button>
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-surface-high"
                onClick={() => {
                  setImageMenuOpen(false);
                  setMediaPickerOpen(true);
                }}
              >
                Medyadan seç
              </button>
            </div>
          ) : null}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onImageFileChange(e)}
        />
        <span className="mx-1 w-px self-stretch bg-border-muted" />
        <ToolbarButton
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Sola hizala"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Ortala"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Sağa hizala"
        >
          ≡
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-border-muted" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Geri al"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Yinele"
        >
          ↷
        </ToolbarButton>
        <ToolbarButton onClick={toggleHtmlMode} title="HTML kaynak">
          HTML
        </ToolbarButton>
      </div>
      <div
        className="bg-background"
        style={{ minHeight }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
      <MediaLibraryPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onApply={(urls) => {
          const url = urls[0];
          if (url) insertImageUrl(url);
          setMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
