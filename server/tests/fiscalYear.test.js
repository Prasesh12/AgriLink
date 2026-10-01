const { currentFiscalYear } = require('../src/utils/fiscalYear');

describe('currentFiscalYear', () => {
  it('stays in the prior fiscal year just before the July 16 cutover', () => {
    expect(currentFiscalYear(new Date('2026-07-15'))).toBe('2082/83');
  });

  it('rolls over to the new fiscal year on July 16', () => {
    expect(currentFiscalYear(new Date('2026-07-16'))).toBe('2083/84');
  });

  it('stays in the new fiscal year later in the year', () => {
    expect(currentFiscalYear(new Date('2026-10-01'))).toBe('2083/84');
  });
});
