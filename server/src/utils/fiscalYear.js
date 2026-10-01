// Nepal's fiscal year starts on Shrawan 1 (Bikram Sambat), which falls around
// mid-July in the Gregorian calendar. We approximate the cutover as July 16
// (AD) rather than converting the real BS calendar, which is accurate enough
// for MSP rate lookups. BS year numbers run ~56/57 years ahead of AD.
function currentFiscalYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  const newFiscalYearStarted = month > 7 || (month === 7 && day >= 16);
  const bsStartYear = year + (newFiscalYearStarted ? 57 : 56);
  const bsEndYearShort = String((bsStartYear + 1) % 100).padStart(2, '0');

  return `${bsStartYear}/${bsEndYearShort}`;
}

module.exports = { currentFiscalYear };
