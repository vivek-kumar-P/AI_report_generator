'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { motion } from 'framer-motion'
import { EditorContent, useEditor } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import EditorErrorBoundary from '@/components/EditorErrorBoundary'

interface A4PageProps {
  contentHtml: string
  pageNumber: number
  totalPages: number
  showBorder: boolean
  showFooter: boolean
  pagePadding: number
  lineHeight: number
  fontSize: string
  fontFamily: string
  textColor: string
  highlightColor: string
  pageTint: string
  pendingImage: File | null
  onImageHandled: () => void
  onContentChange: (html: string) => void
}

export interface A4PageHandle {
  toggleBold: () => void
  toggleItalic: () => void
  toggleUnderline: () => void
  toggleStrike: () => void
  toggleBulletList: () => void
  toggleOrderedList: () => void
  setHeading: (level: 1 | 2 | 3) => void
  setParagraph: () => void
  setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void
  insertHorizontalRule: () => void
  undo: () => void
  redo: () => void
  setLink: (href: string) => void
  unsetLink: () => void
}

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    } as any
  },
})

const A4Page = forwardRef<A4PageHandle, A4PageProps>(({
  contentHtml,
  pageNumber,
  totalPages,
  showBorder,
  showFooter,
  pagePadding,
  lineHeight,
  fontSize,
  fontFamily,
  textColor,
  highlightColor,
  pageTint,
  pendingImage,
  onImageHandled,
  onContentChange,
}: A4PageProps, ref) => {
  const updateTimer = useRef<number | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize,
      Image.configure({ inline: false, allowBase64: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: contentHtml || '<p></p>',
    editorProps: {
      attributes: {
        class: 'tiptap ProseMirror tiptap-editor outline-none w-full',
        style: `
          line-height: ${lineHeight};
          font-size: ${fontSize};
          font-family: ${fontFamily};
          color: ${textColor};
          word-break: break-word;
          overflow-wrap: break-word;
        `,
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = () => {
                editor?.chain().focus().setImage({ src: String(reader.result) }).run()
              }
              reader.readAsDataURL(file)
              return true
            }
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      if (updateTimer.current) window.clearTimeout(updateTimer.current)
      updateTimer.current = window.setTimeout(() => {
        onContentChange(editor.getHTML())
      }, 300)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (contentHtml && contentHtml !== current) {
      editor.commands.setContent(contentHtml, false)
    }
  }, [contentHtml, editor])

  useEffect(() => {
    if (!editor) return
    editor.chain().setFontFamily(fontFamily).run()
  }, [editor, fontFamily])

  useEffect(() => {
    if (!editor) return
    ;(editor.chain() as any).setFontSize(fontSize).run()
  }, [editor, fontSize])

  useEffect(() => {
    if (!editor) return
    editor.chain().setColor(textColor).run()
  }, [editor, textColor])

  useEffect(() => {
    if (!editor) return
    editor.chain().setHighlight({ color: highlightColor }).run()
  }, [editor, highlightColor])

  useEffect(() => {
    if (!editor || !pendingImage) return
    handleImageUpload(pendingImage)
    onImageHandled()
  }, [editor, pendingImage, onImageHandled])

  useImperativeHandle(ref, () => ({
    toggleBold: () => editor?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
    toggleStrike: () => editor?.chain().focus().toggleStrike().run(),
    toggleBulletList: () => editor?.chain().focus().toggleBulletList().run(),
    toggleOrderedList: () => editor?.chain().focus().toggleOrderedList().run(),
    setHeading: (level) => editor?.chain().focus().setHeading({ level }).run(),
    setParagraph: () => editor?.chain().focus().setParagraph().run(),
    setTextAlign: (align) => editor?.chain().focus().setTextAlign(align).run(),
    insertHorizontalRule: () => editor?.chain().focus().setHorizontalRule().run(),
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    setLink: (href) => editor?.chain().focus().setLink({ href }).run(),
    unsetLink: () => editor?.chain().focus().unsetLink().run(),
  }), [editor])

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      editor?.chain().focus().setImage({ src: String(reader.result) }).run()
    }
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(pageNumber * 0.04, 0.4) }}
      className="relative flex justify-center"
    >
      <div
        className={`a4-page w-[794px] min-h-[1123px] shadow-xl rounded-sm ${
          showBorder ? 'ring-1 ring-slate-300' : ''
        }`}
        style={{ backgroundColor: pageTint }}
      >
        <div
          className="w-full min-h-[1123px] flex flex-col"
          style={{
            backgroundColor: pageTint,
            border: showBorder ? '3px solid #94a3b8' : 'none',
            padding: `${pagePadding}px`,
          }}
        >
          <div className="flex-1">
            <EditorErrorBoundary>
              {editor ? (
                <EditorContent editor={editor} />
              ) : (
                <div className="text-sm text-slate-400 animate-pulse">Loading editor...</div>
              )}
            </EditorErrorBoundary>
          </div>

          {showFooter && (
            <div
              className="flex justify-between items-center pt-3 mt-6"
              style={{ borderTop: '1px solid #e2e8f0' }}
            >
              <span className="text-[11px] tracking-wide uppercase" style={{ color: '#94a3b8' }}>
                Generated Report
              </span>
              <span className="text-xs font-semibold" style={{ color: '#64748b' }}>
                {pageNumber} / {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})

A4Page.displayName = 'A4Page'

export default A4Page