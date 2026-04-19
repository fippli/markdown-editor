import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, {
          language: lang,
          ignoreIllegals: true,
        }).value;
      } catch {
        /* fall through to escape-only */
      }
    }
    return "";
  },
});

md.use(taskLists, { enabled: true, label: false });

function extractFrontMatter(src: string): {
  frontMatter: string | null;
  body: string;
} {
  if (!src.startsWith("---\n")) return { frontMatter: null, body: src };
  const end = src.indexOf("\n---\n", 4);
  if (end === -1) return { frontMatter: null, body: src };
  return {
    frontMatter: src.slice(4, end),
    body: src.slice(end + 5),
  };
}

export function renderMarkdown(src: string): string {
  const { frontMatter, body } = extractFrontMatter(src);
  const bodyHtml = md.render(body);
  if (frontMatter === null) return bodyHtml;
  const fmHtml = `<pre class="front-matter"><code>${md.utils.escapeHtml(
    frontMatter,
  )}</code></pre>`;
  return fmHtml + bodyHtml;
}

export interface PreviewHandle {
  show(src: string): void;
  hide(): void;
  toggle(src: string): void;
  isOpen(): boolean;
}

export function createPreview(
  root: HTMLElement,
  onHide: () => void,
): PreviewHandle {
  let open = false;

  const show = (src: string) => {
    root.innerHTML = renderMarkdown(src);
    root.scrollTop = 0;
    document.body.dataset.mode = "preview";
    root.setAttribute("aria-hidden", "false");
    open = true;
  };

  const hide = () => {
    document.body.dataset.mode = "edit";
    root.setAttribute("aria-hidden", "true");
    open = false;
    onHide();
  };

  const toggle = (src: string) => {
    if (open) hide();
    else show(src);
  };

  return { show, hide, toggle, isOpen: () => open };
}
