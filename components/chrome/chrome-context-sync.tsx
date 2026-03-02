'use client';

import { useEffect } from 'react';
import { useChromeContext } from '@/components/system-chrome-client';

type Props = {
  accentColor?: string;
  dividerSet?: string;
  contextLabel?: string;
  contextHref?: string;
  figletFont?: string;
};

export function ChromeContextSync({ accentColor, dividerSet, contextLabel, contextHref, figletFont }: Props) {
  const { setContext } = useChromeContext();

  useEffect(() => {
    setContext({ accentColor, dividerSet, contextLabel, contextHref, figletFont });
    return () => setContext({ accentColor: undefined, dividerSet: undefined, contextLabel: undefined, contextHref: undefined, figletFont: undefined });
  }, [accentColor, dividerSet, contextLabel, contextHref, figletFont, setContext]);

  return null;
}
