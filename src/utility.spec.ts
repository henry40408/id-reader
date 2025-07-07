import { convertDate } from './utility';

describe('convertDate', () => {
  it('should convert Chinese date strings to English', () => {
    expect(convertDate('週六, 14 六月 2025 04:51:00 +0000')).toBe('Sat, 14 Jun 2025 04:51:00 +0000');
    expect(convertDate('Wed, 25 Jun 2025 03:54:43 +0000')).toBe('Wed, 25 Jun 2025 03:54:43 +0000');
  });
});
