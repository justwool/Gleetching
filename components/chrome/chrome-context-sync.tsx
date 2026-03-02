'use client';

import { useEffect } from 'react';
import { useChromeContext } from '@/components/system-chrome';

type Props = {
  accentColor?: string;
  dividerSet?: string;
  contextLabel?: string;
  contextHref?: string;
};

export function ChromeContextSync({ accentColor, dividerSet, contextLabel, contextHref }: Props) {
  const { setContext } = useChromeContext();

  useEffect(() => {
    setContext({ accentColor, dividerSet, contextLabel, contextHref });
    return () => setContext({ accentColor: undefined, dividerSet: undefined, contextLabel: undefined, contextHref: undefined });
  }, [accentColor, dividerSet, contextLabel, contextHref, setContext]);

  return null;
}
