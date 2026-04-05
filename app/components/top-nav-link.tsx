'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ComponentProps, type MouseEvent, type FocusEvent } from 'react';

type TopNavLinkProps = ComponentProps<typeof Link>;

const PRIORITY_ROUTES = ['/machines', '/projects'];

export function TopNavLink({ href, children, className, onClick, onFocus, onMouseEnter, ...props }: TopNavLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const hrefString = useMemo(() => (typeof href === 'string' ? href : href.toString()), [href]);

  useEffect(() => {
    if (pathname === pendingHref) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  useEffect(() => {
    PRIORITY_ROUTES.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  const prefetchIfInternal = () => {
    if (hrefString.startsWith('/')) {
      router.prefetch(hrefString);
    }
  };

  return (
    <Link
      {...props}
      href={href}
      prefetch
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);
        prefetchIfInternal();
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        prefetchIfInternal();
      }}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented && hrefString.startsWith('/')) {
          setPendingHref(hrefString);
        }
      }}
      aria-busy={pendingHref === hrefString}
      className={`${className ?? ''} ${pendingHref === hrefString ? 'opacity-70' : ''}`.trim()}
    >
      {children}
      {pendingHref === hrefString ? <span className="ml-1 animate-pulse">…</span> : null}
    </Link>
  );
}
