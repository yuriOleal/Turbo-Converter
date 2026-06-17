import fc from 'fast-check';

describe('Testing framework smoke test', () => {
  it('vitest globals work', () => {
    expect(1 + 1).toBe(2);
  });

  it('jsdom environment is available', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    expect(div.textContent).toBe('Hello');
  });

  it('jest-dom matchers work', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
    document.body.removeChild(div);
  });

  it('fast-check works', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        expect(a + b).toBe(b + a);
      }),
      { numRuns: 50 }
    );
  });
});
