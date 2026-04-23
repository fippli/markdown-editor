import { renderMarkdown, renderMermaidBlocks } from "./preview";
import syntaxGuideSrc from "./syntax-guide.md?raw";

export interface SyntaxGuideHandle {
  show(): void;
  hide(): void;
  toggle(): void;
  isOpen(): boolean;
}

export function createSyntaxGuide(
  root: HTMLElement,
  onHide: () => void,
): SyntaxGuideHandle {
  let rendered = false;
  let open = false;

  const show = () => {
    if (!rendered) {
      root.innerHTML = renderMarkdown(syntaxGuideSrc);
      rendered = true;
    }
    root.scrollTop = 0;
    document.body.dataset.mode = "syntax-guide";
    root.setAttribute("aria-hidden", "false");
    open = true;
    void renderMermaidBlocks(root);
  };

  const hide = () => {
    document.body.dataset.mode = "edit";
    root.setAttribute("aria-hidden", "true");
    open = false;
    onHide();
  };

  const toggle = () => {
    if (open) hide();
    else show();
  };

  return { show, hide, toggle, isOpen: () => open };
}
