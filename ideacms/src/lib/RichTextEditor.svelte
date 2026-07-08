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
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('bulletList')}
        class:border-slate-400={editorState.editor.isActive('bulletList')}
        onclick={toggleBulletList}
      >
        UL
      </button>

      <button
        type="button"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('orderedList')}
        class:border-slate-400={editorState.editor.isActive('orderedList')}
        onclick={toggleOrderedList}
      >
        OL
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