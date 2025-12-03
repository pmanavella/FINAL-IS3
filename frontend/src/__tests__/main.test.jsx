import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

vi.stubGlobal('alert', vi.fn());

test('bootstrap monta en #root', async () => {
  document.body.innerHTML = '<div id="root"></div>';

  // stub del fetch que dispara App al montar (si no, puede fallar y no renderiza nada)
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  });

  // importa después de crear #root y de stubear fetch
  await import('../main.jsx');

  const root = document.getElementById('root');
  expect(root).toBeTruthy();

  // React 18 con createRoot es async: esperamos al commit
  await waitFor(() => {
    expect(root.childNodes.length).toBeGreaterThan(0);
  });
});
