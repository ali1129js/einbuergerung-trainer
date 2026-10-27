import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A question picture that opens large in an accessible lightbox when clicked or tapped.
 * The trigger is its own button outside the answer buttons, so it never selects an answer.
 */
export function ZoomableImage({ src, alt, title, className }: { src: string; alt: string; title?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openBox = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="zoom-thumb"
        aria-haspopup="dialog"
        aria-label={`Enlarge picture: ${alt}`}
        title={title}
        onClick={openBox}
      >
        <img className={className} src={src} alt={alt} loading="lazy" />
        <span className="zoom-hint" aria-hidden="true">
          <MagnifierIcon />
        </span>
      </button>
      {open && (
        <Lightbox
          src={src}
          alt={alt}
          onClose={() => setOpen(false)}
          returnFocus={() => triggerRef.current?.focus()}
        />
      )}
    </>
  );
}

export function Lightbox({ src, alt, onClose, returnFocus }: { src: string; alt: string; onClose: () => void; returnFocus?: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const captionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const returnRef = useRef(returnFocus);
  returnRef.current = returnFocus;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // Keep the page behind out of reach while the modal is open; timers etc. keep running.
    const root = document.getElementById("root");
    const hadInert = root?.hasAttribute("inert") ?? false;
    root?.setAttribute("inert", "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      if (!hadInert) root?.removeAttribute("inert");
      if (returnRef.current) returnRef.current();
      else previouslyFocused?.focus?.();
    };
  }, []);

  // Focus trap: Tab / Shift+Tab cycle inside the dialog.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="lightbox"
      data-testid="lightbox-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="lightbox__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged picture"
        aria-describedby={captionId}
        onKeyDown={onKeyDown}
      >
        <button ref={closeRef} type="button" className="lightbox__close" aria-label="Close enlarged picture" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
        <figure className="lightbox__figure">
          <div className="lightbox__frame">
            <img className="lightbox__img" src={src} alt={alt} />
          </div>
          <figcaption id={captionId} className="lightbox__caption">
            {alt}
          </figcaption>
        </figure>
      </div>
    </div>,
    document.body
  );
}

function MagnifierIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" focusable="false">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" />
    </svg>
  );
}
