export const REPLACEMENTS = new Map([
  // Chinese day names to English abbreviations
  ['週日', 'Sun'],
  ['週一', 'Mon'],
  ['週二', 'Tue'],
  ['週三', 'Wed'],
  ['週四', 'Thu'],
  ['週五', 'Fri'],
  ['週六', 'Sat'],
  // Chinese month names to English abbreviations
  ['一月', 'Jan'],
  ['二月', 'Feb'],
  ['三月', 'Mar'],
  ['四月', 'Apr'],
  ['五月', 'May'],
  ['六月', 'Jun'],
  ['七月', 'Jul'],
  ['八月', 'Aug'],
  ['九月', 'Sep'],
  ['十月', 'Oct'],
  ['十一月', 'Nov'],
  ['十二月', 'Dec'],
]);

export function convertDate(source: string): string {
  for (const [key, value] of REPLACEMENTS) {
    source = source.replace(key, value);
  }
  return source;
}
