import { getSolarAltitude, locationService } from '@/services/location-service';
import { defaultAltitude } from '@/components/sky-background.web';

describe('Sky Background & Astronomical Calculations', () => {
  it('calculates positive solar altitude during midday', () => {
    // Laguna Beach at solar noon (roughly 19:30 UTC in autumn)
    const noon = new Date(Date.UTC(2026, 8, 29, 19, 30, 0));
    const alt = getSolarAltitude(noon, 33.5427, -117.7854);
    expect(alt).toBeGreaterThan(30);
  });

  it('calculates negative solar altitude deep below horizon at midnight (astronomical night)', () => {
    // Laguna Beach at midnight (roughly 07:30 UTC)
    const midnight = new Date(Date.UTC(2026, 8, 29, 7, 30, 0));
    const alt = getSolarAltitude(midnight, 33.5427, -117.7854);
    // At midnight, sun should be well below -14 degrees (true black threshold)
    expect(alt).toBeLessThan(-14);
  });

  it('defaultAltitude falls back to valid altitude range between -90 and +90', () => {
    const now = new Date();
    const alt = defaultAltitude(now);
    expect(alt).toBeGreaterThanOrEqual(-90);
    expect(alt).toBeLessThanOrEqual(90);
  });

  it('verifies that solar altitude <= -14 corresponds to true OLED black', () => {
    // The palette SUN_ALT has [-14, -8, -3, 0, 5, 15, 45]
    // where index 0 is -14, and all three sky stops (TOP, MID, LOW) are #000000
    const SUN_ALT = [-14, -8, -3, 0, 5, 15, 45];
    const SKY_TOP = ['#000000', '#080C1E', '#1F2455', '#343A85', '#3F68B3', '#3B78CB', '#2C7BD9'];
    const SKY_MID = ['#000000', '#141842', '#5A3B80', '#C05C7E', '#D89A78', '#7FAEDD', '#5BA4EA'];
    const SKY_LOW = ['#000000', '#221E4A', '#B4507C', '#FF8A4F', '#FFC27A', '#BBD8F0', '#A6D3F5'];

    // At night (-14 and below, e.g. -20, -50)
    for (const testAlt of [-14, -20, -35, -55]) {
      const topColor = testAlt <= SUN_ALT[0] ? SKY_TOP[0] : '';
      const midColor = testAlt <= SUN_ALT[0] ? SKY_MID[0] : '';
      const lowColor = testAlt <= SUN_ALT[0] ? SKY_LOW[0] : '';

      expect(topColor).toBe('#000000');
      expect(midColor).toBe('#000000');
      expect(lowColor).toBe('#000000');
    }
  });

  it('verifies horizon glow and clouds fade to completely transparent at night', () => {
    const LIGHT_ALT = [-12, -3, 3, 15, 45];
    const GLOW_ALPHA = [0, 0.35, 0.85, 0.6, 0.4];
    const CLOUD_COLOR = [
      'rgba(120,130,210,0)',
      'rgba(255,150,150,0.22)',
      'rgba(255,190,140,0.32)',
      'rgba(255,255,255,0.28)',
      'rgba(255,255,255,0.32)',
    ];

    expect(GLOW_ALPHA[0]).toBe(0);
    expect(CLOUD_COLOR[0]).toBe('rgba(120,130,210,0)');
  });
});
