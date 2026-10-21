// Period each KPI's latest data point covers, where verified against a source (as of Oct 2026).
// KPIs not listed fall back to "<latest year> (est.)" — their newest values are unverified estimates.
export const AS_OF: Record<string, string> = {
  'gdp-growth': 'Q2 2026',
  'unemployment': 'Sep 2026',
  'inflation': 'Sep 2026',
  'sp500': 'Oct 20, 2026',
  'budget-balance': 'FY2026 (Sep 2026)',
  'federal-revenue': 'FY2026 (Sep 2026)',
  'federal-spending': 'FY2026 (Sep 2026)',
  'violent-crime': '2025',
  'property-crime': '2025',
  'drug-overdoses': '2025 (provisional)',
  'poverty-rate': '2025',
  'uninsured': '2025',
  'homeownership': 'Q2 2026',
  'savings-rate': '2025',
  'life-expectancy': '2024',
  'infant-mortality': '2025 (provisional)',
  'labor-participation': 'Sep 2026',
};
