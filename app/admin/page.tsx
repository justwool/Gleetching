'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SAFE_FONTS } from '@/lib/chrome/fonts';

type Collection = { id: string; ident: string; title: string; slug: string };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [log, setLog] = useState<string[]>(['transfer utility booted']);
  const [figletFont, setFigletFont] = useState<string>('Small');
  const [wordmarkPlacement, setWordmarkPlacement] = useState<string>('RIGHT');
  const [wordmarkBarFollowsFiglet, setWordmarkBarFollowsFiglet] = useState<boolean>(true);

  const append = (line: string) => setLog((lines) => [line, ...lines].slice(0, 100));

  const refresh = async () => {
    const cols = await fetch('/api/admin/collections');
    if (cols.ok) {
      const payload = await cols.json();
      setCollections(payload.items ?? []);
      setAuth(true);
      const settings = await fetch('/api/admin/site-settings');
      if (settings.ok) {
        const settingPayload = await settings.json();
        setFigletFont(settingPayload.figletFont || 'Small');
        setWordmarkPlacement(settingPayload.wordmarkPlacement || 'RIGHT');
        setWordmarkBarFollowsFiglet(settingPayload.wordmarkBarFollowsFiglet ?? true);
      }
    }
  };

  useEffect(() => {
    refresh().catch(() => null);
  }, []);

  const login = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    setAuth(res.ok);
    append(res.ok ? 'OK session established' : 'ERR bad auth');
    if (res.ok) refresh();
  };

  const submitCollection = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    append(res.ok ? 'OK collection created' : 'ERR collection failed');
    e.currentTarget.reset();
    refresh();
  };

  const submitUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const body = await res.json();
    append(body.line || 'ERR upload');
    if (res.ok) e.currentTarget.reset();
  };

  const updateFont = async (nextFont: string) => {
    setFigletFont(nextFont);
    const res = await fetch('/api/admin/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ figletFont: nextFont })
    });
    if (!res.ok) {
      append('ERR font update failed');
      return;
    }
    append(`OK figlet font set ${nextFont}`);
    const payload = await res.json();
    setWordmarkPlacement(payload.wordmarkPlacement || 'RIGHT');
    setWordmarkBarFollowsFiglet(payload.wordmarkBarFollowsFiglet ?? true);
    window.dispatchEvent(new CustomEvent('figlet-font-change', { detail: { figletFont: nextFont } }));
  };

  return (
    <section className="frame">
      <p>admin:// terminal transfer utility</p>
      {!auth ? (
        <div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
          <button onClick={login}>authorize</button>
        </div>
      ) : null}

      {auth ? (
        <div style={{ margin: '8px 0', display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><label htmlFor="figletFont">FIGlet Wordmark Font</label>
          <select id="figletFont" value={figletFont} onChange={(e) => updateFont(e.target.value)}>
            {SAFE_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
          </select></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><label>Wordmark Placement</label><input value={wordmarkPlacement} readOnly /></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><label>Bar Follows FIGlet</label><input value={wordmarkBarFollowsFiglet ? 'true' : 'false'} readOnly /></div>
        </div>
      ) : null}

      <form onSubmit={submitCollection}>
        <input name="ident" placeholder="ident" required />
        <input name="title" placeholder="title" required />
        <input name="year" placeholder="year" required />
        <input name="tags" placeholder="tags comma" />
        <input name="accentColor" placeholder="#8eb8b8" />
        <select name="dividerSet"><option>pipe</option><option>hatch</option><option>double</option><option>dot</option></select>
        <select name="headerStyle"><option>stack</option><option>field</option><option>relay</option></select>
        <select name="figletFont"><option>Small</option><option>Standard</option><option>Slant</option><option>Big</option><option>Mini</option></select>
        <button type="submit">create collection</button>
      </form>
      <form onSubmit={submitUpload}>
        <select name="collectionId" required>{collections.map((c) => <option key={c.id} value={c.id}>{c.ident} / {c.title}</option>)}</select>
        <input name="title" placeholder="piece title" required />
        <input type="file" name="file" accept="image/*" required />
        <button type="submit">upload</button>
      </form>
      <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
        {collections.map((c) => (
          <div key={c.id} style={{ display: 'flex', gap: 6 }}>
            <span>{c.ident}</span>
            <button onClick={async () => {
              const res = await fetch('/api/admin/delete-collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: c.id })
              });
              append(res.ok ? `OK removed ${c.ident}` : `ERR remove ${c.ident}`);
              refresh();
            }}>delete collection</button>
          </div>
        ))}
      </div>
      <pre>{log.join('\n')}</pre>
    </section>
  );
}
