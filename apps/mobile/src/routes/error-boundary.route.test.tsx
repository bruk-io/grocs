// R33: a render error is logged with the route pattern, and the retry screen offers another try.
import { FakeClock, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

describe('root ErrorBoundary', () => {
  it('logs the render error without its message and retries on Try again', async () => {
    vi.resetModules();
    const { installObservers, observer } = await import('../composition/observe.ts');
    const { ErrorBoundary } = await import('../../app/_layout.tsx');
    const logger = new MemoryLogger();
    installObservers({ logger, clock: new FakeClock(), ids: new SequentialIds('t'), globals: {} });
    observer().screen('/week/[weekId]');
    const retry = vi.fn(() => Promise.resolve());

    render(<ErrorBoundary error={new Error('bad render of Oat milk')} retry={retry} />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    const record = logger.records().find((r) => r.message === 'render error');
    expect(record?.attributes).toMatchObject({ source: 'render', route: '/week/[weekId]', error: { name: 'Error' } });
    expect(JSON.stringify(logger.records())).not.toContain('Oat milk');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
