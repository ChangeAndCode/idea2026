<script>
  import { onMount, onDestroy } from 'svelte';
  import {StarterKit} from "@tiptap/starter-kit";
  import { Editor } from '@tiptap/core';
  import Underline from '@tiptap/extension-underline';
  import Link from '@tiptap/extension-link';
  import Placeholder from '@tiptap/extension-placeholder';
  

  let {
    value = '',
    disabled = false,
    placeholder = '',
    onChange = () => {},
  } = $props();

let editorElement = $state();
  let editorState = $state({ editor: null, version: 0 });

  onMount(()=> {
    const editor = new Editor({
      element: editorElement,
      extensions:[
        StarterKit.configure({
          heading: {levels:[2,3,4]},
          link: false,
          underline: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Escribe aquí el texto de la página...',
          emptyEditorClass: 'is-editor-empty',
        }),
      ],
      content: value || "",
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      onTransaction: ({ editor }) => {
        // fuerza re-render para que isActive() se actualice en la UI
        editorState = {
          editor,
          version: editorState.version + 1,
        };
      },
    });
    editorState = { editor, version: 0 };
  });

  onDestroy(() => {
    editorState.editor?.destroy();
  });

  $effect(() => {
    const editor = editorState.editor;
    if (!editor) return;
    editor.setEditable(!disabled);
  });

  $effect(() => {
    const editor = editorState.editor;
    if (!editor) return;

    const incoming = value ?? '';
    const current = editor.getHTML();

    if (incoming !== current) {
      editor.commands.setContent(incoming, false);
    }
  });

  function setParagraph() {
    editorState.editor?.chain().focus().setParagraph().run();
  }

  function toggleHeading(level) {
    editorState.editor?.chain().focus().toggleHeading({ level }).run();
  }

  function toggleBold() {
    editorState.editor?.chain().focus().toggleBold().run();
  }

  function toggleItalic() {
    editorState.editor?.chain().focus().toggleItalic().run();
  }

  function toggleUnderline() {
    editorState.editor?.chain().focus().toggleUnderline().run();
  }

  function toggleBulletList() {
    editorState.editor?.chain().focus().toggleBulletList().run();
  }

  function toggleOrderedList() {
    editorState.editor?.chain().focus().toggleOrderedList().run();
  }
</script>

<div class="rich-text-editor space-y-3">
  {#if editorState.editor}
    <div class="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2">
      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('paragraph')}
        class:border-slate-400={editorState.editor.isActive('paragraph')}
        onclick={setParagraph}
      >
        P
      </button>

      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('heading', { level: 2 })}
        class:border-slate-400={editorState.editor.isActive('heading', { level: 2 })}
        onclick={() => toggleHeading(2)}
      >
        H2
      </button>

      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('heading', { level: 3 })}
        class:border-slate-400={editorState.editor.isActive('heading', { level: 3 })}
        onclick={() => toggleHeading(3)}
      >
        H3
      </button>

      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm font-bold"
        class:bg-slate-200={editorState.editor.isActive('bold')}
        class:border-slate-400={editorState.editor.isActive('bold')}
        onclick={toggleBold}
      >
        B
      </button>

      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm italic"
        class:bg-slate-200={editorState.editor.isActive('italic')}
        class:border-slate-400={editorState.editor.isActive('italic')}
        onclick={toggleItalic}
      >
        I
      </button>

      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm underline"
        class:bg-slate-200={editorState.editor.isActive('underline')}
        class:border-slate-400={editorState.editor.isActive('underline')}
        onclick={toggleUnderline}
      >
        U
      </button>

      <button
        type="button"
        aria-label="unorderList"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm w-10 h-10"
        class:bg-slate-200={editorState.editor.isActive('bulletList')}
        class:border-slate-400={editorState.editor.isActive('bulletList')}
        onclick={toggleBulletList}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
            </path>
        </svg>
      </button>

      <button
        type="button"
        aria-label="orderList"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm w-10 h-10"
        class:bg-slate-200={editorState.editor.isActive('orderedList')}
        class:border-slate-400={editorState.editor.isActive('orderedList')}
        onclick={toggleOrderedList}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10 6L21 6.00066M10 12L21 12.0007M10 18L21 18.0007M3 5L5 4V10M5 10H3M5 10H7M7 20H3L6.41274 17.0139C6.78593 16.6873 7 16.2156 7 15.7197C7 14.7699 6.23008 14 5.28033 14H5C4.06808 14 3.28503 14.6374 3.06301 15.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
          </path>
        </svg>
      </button>
    </div>
  {/if}

  <div
    bind:this={editorElement}
    class="cms-input min-h-[20rem] py-3 leading-relaxed"
  ></div>
</div>

<style>
  :global(.rich-text-editor .ProseMirror) {
    min-height: 20rem;
    outline: none;
  }

  :global(.rich-text-editor .ProseMirror p) {
    margin: 0 0 0.75rem 0;
  }

  :global(.rich-text-editor .ProseMirror h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 1rem 0 0.75rem;
  }

  :global(.rich-text-editor .ProseMirror h3) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0.875rem 0 0.5rem;
  }

  :global(.rich-text-editor .ProseMirror ul) {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
  }

  :global(.rich-text-editor .ProseMirror ol) {
    list-style: decimal;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
  }

  :global(.rich-text-editor .ProseMirror li) {
    margin: 0.25rem 0;
  }

  :global(.rich-text-editor .ProseMirror a) {
    color: #1d4ed8;
    text-decoration: underline;
  }

  :global(.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>