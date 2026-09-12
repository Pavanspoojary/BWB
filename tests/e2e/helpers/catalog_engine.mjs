/**
 * Authoritative Catalog & Burn Calculator Engine
 * Implements the operational logic specified in:
 * - survey_report.md § 4.2, 4.3, 4.5
 * - PROJECT.md § Architecture, § Feature Inventory
 */

export function calculateActiveBurnSavings(hacks) {
  if (!Array.isArray(hacks)) {
    return { activeTotal: 0, graveyardTotal: 0, annualAvoided: 0, categoryBreakdown: {} };
  }

  let activeTotal = 0;
  let graveyardTotal = 0;
  const categoryBreakdown = {
    'Active Sacrilege': 0,
    'Clean Loophole': 0,
    'The Graveyard': 0,
  };

  for (const hack of hacks) {
    const savings = Number(hack.estimated_monthly_savings) || 0;
    if (savings <= 0) continue;

    if (hack.category in categoryBreakdown) {
      categoryBreakdown[hack.category] += savings;
    }

    if (hack.category === 'The Graveyard' || hack.is_deprecated) {
      graveyardTotal += savings;
    } else {
      activeTotal += savings;
    }
  }

  return {
    activeTotal,
    graveyardTotal,
    annualAvoided: activeTotal * 12,
    categoryBreakdown,
  };
}

export function filterCatalog(hacks, { category = 'ALL', saasTarget = 'ALL', query = '' } = {}) {
  if (!Array.isArray(hacks)) return [];

  const normalizedQuery = (query || '').trim().toLowerCase();

  return hacks.filter(hack => {
    // Category filter
    if (category && category !== 'ALL') {
      if (hack.category !== category) return false;
    }

    // SaaS Target filter
    if (saasTarget && saasTarget !== 'ALL') {
      if (hack.saas_target !== saasTarget) return false;
    }

    // Query filter
    if (normalizedQuery) {
      const matchTitle = (hack.title || '').toLowerCase().includes(normalizedQuery);
      const matchDesc = (hack.description || '').toLowerCase().includes(normalizedQuery);
      const matchReplaces = (hack.replaces_saas || '').toLowerCase().includes(normalizedQuery);
      const matchPrimitives = Array.isArray(hack.primitives_abused) &&
        hack.primitives_abused.some(p => p.toLowerCase().includes(normalizedQuery));

      if (!matchTitle && !matchDesc && !matchReplaces && !matchPrimitives) {
        return false;
      }
    }

    return true;
  });
}

export function getSinMeterStyle(riskLevel) {
  switch (riskLevel) {
    case 'Low':
      return {
        score: '2/10',
        color: 'green',
        label: 'LAW-ABIDING CITIZEN (TOS Compliant)',
        bar: '■■□□□□□□□□',
        cssBorder: 'border-green-500',
        badgeText: '[SIN: 1/10 LOW]',
      };
    case 'TOS Gray Area':
      return {
        score: '6/10',
        color: 'amber',
        label: 'PROCEED WITH BURNER ACCOUNT (Egress/Bandwidth Exploitation)',
        bar: '■■■■■■□□□□',
        cssBorder: 'border-amber-500',
        badgeText: '[SIN: 6/10 GRAY]',
      };
    case 'Nuclear':
      return {
        score: '10/10',
        color: 'red',
        label: 'BANHAMMER IMMINENT (Direct Platform Terms Violation)',
        bar: '■■■■■■■■■■',
        cssBorder: 'border-red-600',
        badgeText: '[SIN: 10/10 NUCLEAR]',
      };
    default:
      return {
        score: '0/10',
        color: 'gray',
        label: 'UNRATED / UNKNOWN RISK',
        bar: '□□□□□□□□□□',
        cssBorder: 'border-zinc-500',
        badgeText: '[SIN: UNRATED]',
      };
  }
}
