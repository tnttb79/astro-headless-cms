import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface NavItem { href: string; label: string; }
interface Props { items: NavItem[]; bookingUrl: string; currentPath: string; }

export default function MobileNav({ items, bookingUrl, currentPath }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return () => document.body.classList.remove("menu-open");
    const focusable = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); return; }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("menu-open"); };
  }, [open]);

  const overlay = open ? createPortal(
    <div className="mobile-nav__backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div ref={panel} id="mobile-menu" className="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Site navigation">
        <button className="mobile-nav__close" type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label="Close navigation">×</button>
        <nav aria-label="Mobile navigation"><ul>
          {items.map((item) => <li key={item.href}><a href={item.href} aria-current={currentPath === item.href ? "page" : undefined}>{item.label}</a></li>)}
        </ul></nav>
        <div className="mobile-nav__booking-actions">
          <a className="mobile-nav__book mobile-nav__book--zocdoc" href={bookingUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="booking_click" data-analytics-section="mobile_header_zocdoc">Book on Zocdoc</a>
          <a className="mobile-nav__book mobile-nav__book--direct" href="/book" data-analytics-event="booking_click" data-analytics-section="mobile_header_direct">Book directly</a>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return <div className="mobile-nav">
    <button ref={trigger} className="mobile-nav__trigger" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
      <span aria-hidden="true">☰</span><span>Menu</span>
    </button>
    {overlay}
    <style>{`
      .mobile-nav { display:none; }
      .mobile-nav__trigger { min-width:44px; min-height:44px; display:flex; align-items:center; gap:.45rem; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--pine-deep); padding:.5rem .8rem; font-weight:600; }
      .mobile-nav__backdrop { position:fixed; inset:0; z-index:1100; display:flex; justify-content:flex-end; min-height:100vh; min-height:100dvh; background:rgb(22 48 42 / .62); }
      .mobile-nav__panel { position:relative; width:min(90vw,24rem); height:100%; min-height:100vh; min-height:100dvh; max-height:100dvh; overflow-y:auto; overscroll-behavior:contain; padding:max(5rem,calc(env(safe-area-inset-top) + 4rem)) max(1.5rem,env(safe-area-inset-right)) max(2rem,env(safe-area-inset-bottom)) 1.5rem; background:#f1f2ed; background:var(--paper); box-shadow:-18px 0 60px rgb(0 0 0 / .18); }
      .mobile-nav__close { position:absolute; top:max(1rem,env(safe-area-inset-top)); right:max(1rem,env(safe-area-inset-right)); width:44px; height:44px; border:0; background:transparent; color:var(--pine-deep); font-size:2rem; }
      .mobile-nav ul { list-style:none; padding:0; margin:0 0 2rem; }
      .mobile-nav li { border-bottom:1px solid var(--line); }
      .mobile-nav nav a { display:block; min-height:50px; padding:.8rem .2rem; color:var(--pine-deep); font:400 1.45rem/1.2 var(--font-display); text-decoration:none; }
      .mobile-nav nav a[aria-current="page"] { color:var(--dawn-ink); }
      .mobile-nav__booking-actions { display:grid; gap:.7rem; }
      .mobile-nav__book { min-height:46px; display:flex; align-items:center; justify-content:center; border:1px solid transparent; border-radius:999px; color:var(--pine-deep); text-decoration:none; font-weight:600; }
      .mobile-nav__book--zocdoc { background:var(--dawn); }
      .mobile-nav__book--direct { border-color:var(--pine); background:var(--surface); }
      @media(max-width:1160px){ .mobile-nav{display:block;} }
    `}</style>
  </div>;
}
