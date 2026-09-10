"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ACTIVE_CLASS, getActiveRouteId } from "./navItems";

export default function MobileBottomNav() {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const pathname = usePathname();
  const activeRouteId = getActiveRouteId(pathname);

  const closePopover = () => setExpandedGroupId(null);

  return (
    <>
      {expandedGroupId && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closePopover}
          className="fixed inset-0 z-30 md:hidden"
        />
      )}

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-0.5 rounded-full border border-[#8D0801]/15 bg-[#FDF8EE] px-2 py-2 shadow-lg md:hidden"
      >
        {NAV_ITEMS.map(({ id, label, icon, iconClass, path, children }) => {
          const isActive = activeRouteId === id;
          const isGroupActive = children?.some((child) => child.id === activeRouteId) ?? false;

          if (children) {
            const isOpen = expandedGroupId === id;

            return (
              <div key={id} className="relative flex flex-1 justify-center">
                {isOpen && (
                  <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-40 flex -translate-x-1/2 flex-col gap-1 whitespace-nowrap rounded-2xl border border-[#8D0801]/15 bg-[#FDF8EE] p-2 shadow-lg">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.path}
                        onClick={closePopover}
                        className={`rounded-xl px-4 py-2 text-left text-sm font-medium transition-colors ${
                          activeRouteId === child.id ? ACTIVE_CLASS : "text-[#103D23] hover:bg-black/5"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setExpandedGroupId((prev) => (prev === id ? null : id))}
                  aria-expanded={isOpen}
                  aria-label={label}
                  title={label}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                    isGroupActive || isOpen ? ACTIVE_CLASS : "text-[#103D23]"
                  }`}
                >
                  <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
                </button>
              </div>
            );
          }

          if (!path) {
            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={label}
                onClick={closePopover}
                className={`flex flex-1 items-center justify-center rounded-full py-2 transition-colors ${
                  isActive ? ACTIVE_CLASS : "text-[#103D23]"
                }`}
              >
                <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
              </button>
            );
          }

          return (
            <Link
              key={id}
              href={path}
              onClick={closePopover}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              title={label}
              className={`flex flex-1 items-center justify-center rounded-full py-2 transition-colors ${
                isActive ? ACTIVE_CLASS : "text-[#103D23]"
              }`}
            >
              <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
