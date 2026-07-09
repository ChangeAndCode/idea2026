<script>
  import { onMount, onDestroy } from 'svelte';
  import {StarterKit} from "@tiptap/starter-kit";
  import { Editor } from '@tiptap/core';
  import Underline from '@tiptap/extension-underline';
  import Link from '@tiptap/extension-link';
  import Placeholder from '@tiptap/extension-placeholder';
  import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import { TextStyleKit } from '@tiptap/extension-text-style';
  

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
          heading: {levels:[2,3,4,5]},
          link: false,
          underline: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        }),
        Highlight,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          alignments: ['left', 'center', 'right'],
        }),
        TextStyleKit.configure({
          fontSize: true,
          fontFamily: false,
          color: false,
          backgroundColor: false,
          lineHeight: false,
        }),
        TableKit.configure({
          table: {
            resizable: true,
          },
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
  function toggleStrike() {
  editorState.editor?.chain().focus().toggleStrike().run();
}

function toggleHighlight() {
  editorState.editor?.chain().focus().toggleHighlight().run();
}

function setTextAlign(alignment) {
  editorState.editor?.chain().focus().setTextAlign(alignment).run();
}

function unsetTextAlign() {
  editorState.editor?.chain().focus().unsetTextAlign().run();
}

function setLink() {
  const previousUrl = editorState.editor?.getAttributes('link').href ?? '';
  const url = window.prompt('URL del enlace', previousUrl);
  if (url === null) return;
  if (url.trim() === '') {
    editorState.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editorState.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

function insertTable() {
  editorState.editor?.chain().focus().insertTable({
    rows: 3,
    cols: 3,
    withHeaderRow: true,
  }).run();
}

function addColumnAfter() {
  editorState.editor?.chain().focus().addColumnAfter().run();
}

function addRowAfter() {
  editorState.editor?.chain().focus().addRowAfter().run();
}

function deleteColumn() {
  editorState.editor?.chain().focus().deleteColumn().run();
}

function deleteRow() {
  editorState.editor?.chain().focus().deleteRow().run();
}

function deleteTable() {
  editorState.editor?.chain().focus().deleteTable().run();
}

function setBlockType(value){
  const editor = editorState.editor;
  if (!editor) return;
  if (value === "paragraph"){
    editor.chain().focus.setParagraph().run();
    return;
  }
  editor.chain().focus().setHeading({level: Number(value)}).run();
}

function getCurrentBlockType() {
  const editor = editorState.editor;
  if (!editor) return 'paragraph';

  if (editor.isActive('heading', { level: 2 })) return '2';
  if (editor.isActive('heading', { level: 3 })) return '3';
  if (editor.isActive('heading', { level: 4 })) return '4';
  if (editor.isActive('heading', { level: 5 })) return '5';

  return 'paragraph';
}

function setFontSize(value) {
  const editor = editorState.editor;
  if (!editor) return;

  if (!value) {
    editor.chain().focus().unsetFontSize().run();
    return;
  }

  editor.chain().focus().setFontSize(value).run();
}

function getCurrentFontSize() {
  const editor = editorState.editor;
  if (!editor) return '';

  return editor.getAttributes('textStyle').fontSize ?? '';
}

</script>

<div class="rich-text-editor space-y-3">
  {#if editorState.editor}
    <div class="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2">

      <select
        title="Headings"
        class="cms-input !w-auto !min-h-0 !py-1.5 !px-3 text-sm"
        value={getCurrentBlockType()}
        onchange={(event) => setBlockType(event.currentTarget.value)}
      >
        <option value="paragraph">H</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
        <option value="4">H4</option>
        <option value="5">H5</option>
      </select>

      <div class="relative">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 align-middle text-slate-500"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 6h4m4 0h-4m0 0v12M4 11h3m3 0H7m0 0v7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <select
          class="cms-input !w-auto !min-h-0 !pr-8 text-sm"
          value={getCurrentFontSize()}
          onchange={(event) => setFontSize(event.currentTarget.value)}
          aria-label="Tamaño de fuente"
        >
          <option value=""></option>
          <option value="10px">10</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
        </select>
      </div>

      <button
        type="button"
        title="Paragraph"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('paragraph')}
        class:border-slate-400={editorState.editor.isActive('paragraph')}
        onclick={setParagraph}
      >
        P
      </button>

      <button
        type="button"
        title="Bold"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm font-bold"
        class:bg-slate-200={editorState.editor.isActive('bold')}
        class:border-slate-400={editorState.editor.isActive('bold')}
        onclick={toggleBold}
      >
        B
      </button>

      <button
        type="button"
        title="Italic"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm italic"
        class:bg-slate-200={editorState.editor.isActive('italic')}
        class:border-slate-400={editorState.editor.isActive('italic')}
        onclick={toggleItalic}
      >
        I
      </button>

      <button
        type="button"
        title="Underline"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm underline"
        class:bg-slate-200={editorState.editor.isActive('underline')}
        class:border-slate-400={editorState.editor.isActive('underline')}
        onclick={toggleUnderline}
      >
        U
      </button>

      <button
        type="button"
        title="Unorder List"
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
        title="Order List"
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
      <button
        type="button"
        title="Strikethrough"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm line-through"
        class:bg-slate-200={editorState.editor.isActive('strike')}
        class:border-slate-400={editorState.editor.isActive('strike')}
        onclick={toggleStrike}
      >
        S
      </button>

      <button
        type="button"
        title="Highlight"
        aria-label="highlight"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('highlight')}
        class:border-slate-400={editorState.editor.isActive('highlight')}
        onclick={toggleHighlight}
      >
          <svg
            class="w-4 h-4"
            viewBox="0 0 30 30"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M5 3c4.14545 3.80868 5.00112 6.00015 5 11h10c-.00112-4.99985.85455-7.19132 5-11H15zm6 13v10l8-6.154297V16z" />
          </svg>
      </button>

      <button
        type="button"
        aria-label="link"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        class:bg-slate-200={editorState.editor.isActive('link')}
        class:border-slate-400={editorState.editor.isActive('link')}
        onclick={setLink}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15.197 3.35462C16.8703 1.67483 19.4476 1.53865 20.9536 3.05046C22.4596 4.56228 22.3239 7.14956 20.6506 8.82935L18.2268 11.2626M10.0464 14C8.54044 12.4882 8.67609 9.90087 10.3494 8.22108L12.5 6.06212"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M13.9536 10C15.4596 11.5118 15.3239 14.0991 13.6506 15.7789L11.2268 18.2121L8.80299 20.6454C7.12969 22.3252 4.55237 22.4613 3.0464 20.9495C1.54043 19.4377 1.67609 16.8504 3.34939 15.1706L5.77323 12.7373"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="left"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={() => setTextAlign('left')}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 18H14M4 14H20M4 10H14M4 6H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        
      </button>

      <button
        type="button"
        aria-label="center"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={() => setTextAlign('center')}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M17 18H7M20 14H4M17 10H7M20 6H4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="right"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={() => setTextAlign('right')}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20 18H10M20 14H4M20 10H10M20 6H4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="createTable"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={insertTable}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11 4H15.8002C16.9203 4 17.4801 4 17.9079 4.21799C18.2842 4.40973 18.5905 4.71547 18.7822 5.0918C19 5.5192 19 6.07899 19 7.19691V9.0002L11.0001 9.0001M11 4H6.2002C5.08009 4 4.51962 4 4.0918 4.21799C3.71547 4.40973 3.40973 4.71547 3.21799 5.0918C3 5.51962 3 6.08009 3 7.2002V9M11 4L11.0001 9.0001M3 9V15M3 9L11.0001 9.0001M3 15V16.8002C3 17.9203 3 18.4801 3.21799 18.9079C3.40973 19.2842 3.71547 19.5905 4.0918 19.7822C4.5192 20 5.07899 20 6.19691 20H11.0002L11.0001 9.0001M3 15H11M15 16H18M18 16H21M18 16V19M18 16V13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="deleteTable"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={deleteTable}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11 4H15.8002C16.9203 4 17.4801 4 17.9079 4.21799C18.2842 4.40973 18.5905 4.71547 18.7822 5.0918C19 5.5192 19 6.07899 19 7.19691V9.0002L11.0001 9.0001M11 4H6.2002C5.08009 4 4.51962 4 4.0918 4.21799C3.71547 4.40973 3.40973 4.71547 3.21799 5.0918C3 5.51962 3 6.08009 3 7.2002V9M11 4L11.0001 9.0001M3 9V15M3 9L11.0001 9.0001M3 15V16.8002C3 17.9203 3 18.4801 3.21799 18.9079C3.40973 19.2842 3.71547 19.5905 4.0918 19.7822C4.5192 20 5.07899 20 6.19691 20H11.0002L11.0001 9.0001M3 15H11M15 16H21"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="addColumn"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={addColumnAfter}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 1920 1920"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M1740 0c99.24 0 180 80.76 180 180v1560c0 99.24-80.76 180-180 180H180c-99.24 0-180-80.76-180-180V180C0 80.76 80.76 0 180 0h1560Zm60 1320h-480v480h420c33 0 60-27 60-60v-420Zm-600 0H720v480h480v-480Zm600-600h-480v480h480V720Zm-600 0H720v480h480V720Zm540-600h-420v480h480V180c0-33-27-60-60-60Zm-540 0H720v480h480V120Z"
            fill-rule="evenodd"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="addRow"
        class="cms-btn-secondary !py-1.5 !px-3 text-sm"
        onclick={addRowAfter}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 1920 1920"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M1740 0c99.24 0 180 80.76 180 180v1560c0 99.24-80.76 180-180 180H180c-99.24 0-180-80.76-180-180V180C0 80.76 80.76 0 180 0Zm60 1320h-480v480h420c33 0 60-27 60-60v-420Zm-600 0H720v480h480v-480Zm-600 0H120v420c0 33 27 60 60 60h420v-480ZM1740 120h-420v480h480V180c0-33-27-60-60-60Zm-540 0H720v480h480V120Zm-600 0H180c-33 0-60 27-60 60v420h480V120Z"
            fill-rule="evenodd"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="deleteColumn"
        disabled={!editorState.editor.can().chain().focus().deleteColumn().run()}
        class="cms-btn-secondary !py-1.5 !px-3 text-sm w-10 h-10"
        onclick={deleteColumn}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 1920 1920"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M1694.232 1694.064h-338.88v-194.04h-225.96v194.04h-338.76v-194.04h-225.96v194.04h-338.76V225.984h338.76v199.8h225.96v-199.8h338.76v199.8h225.96v-199.8h338.88v1468.08Zm-.12-1694.04h-1468.2C101.352.024.072 101.304.072 225.984v1468.08c0 124.68 101.28 225.96 225.84 225.96h1468.2c124.56 0 225.96-101.28 225.96-225.96V225.984c0-124.68-101.4-225.96-225.96-225.96ZM1201.344 484.92l-241.32 241.32-241.2-241.32-233.88 233.76L726.264 960l-241.32 241.32 233.88 233.76 241.2-241.32 241.32 241.32 233.64-233.76-241.2-241.32 241.2-241.32-233.64-233.76Z"
            fill-rule="evenodd"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="deleteRow"
        disabled={!editorState.editor.can().chain().focus().deleteRow().run()}
        class="cms-btn-secondary !py-1.5 !px-3 text-sm w-10 h-10"
        onclick={deleteRow}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 1920 1920"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M225.936 1694.232v-338.88h194.04v-225.96h-194.04v-338.76h194.04v-225.96h-194.04v-338.76h1468.08v338.76h-199.8v225.96h199.8v338.76h-199.8v225.96h199.8v338.88H225.936Zm1694.04-.12v-1468.2c0-124.56-101.28-225.84-225.96-225.84H225.936c-124.68 0-225.96 101.28-225.96 225.84v1468.2c0 124.56 101.28 225.96 225.96 225.96h1468.08c124.68 0 225.96-101.4 225.96-225.96Zm-1201.46-258.94 241.32-241.32 241.2 241.32 233.88-233.76-241.32-241.32 241.32-241.32-233.88-233.76-241.2 241.32-241.32-241.32-233.64 233.76 241.2 241.32-241.2 241.32 233.64 233.76Z"
            fill-rule="evenodd"
          />
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

  :global(.rich-text-editor .ProseMirror h4) {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0.75rem 0 0.5rem;
  }

  :global(.rich-text-editor .ProseMirror h5) {
    font-size: 1rem;
    font-weight: 700;
    margin: 0.75rem 0 0.5rem;
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

    :global(.rich-text-editor .ProseMirror table) {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin: 1rem 0;
  }

  :global(.rich-text-editor .ProseMirror th),
  :global(.rich-text-editor .ProseMirror td) {
    border: 1px solid #cbd5e1;
    padding: 0.75rem;
    vertical-align: top;
  }

  :global(.rich-text-editor .ProseMirror th) {
    background: #f8fafc;
    font-weight: 700;
  }

  :global(.rich-text-editor .ProseMirror .selectedCell) {
    background: #dbeafe;
  }

  :global(.rich-text-editor .ProseMirror .tableWrapper) {
    overflow-x: auto;
  }

  :global(.rich-text-editor .ProseMirror .column-resize-handle) {
    background-color: #2563eb;
    width: 4px;
  }



</style>