import { Product } from '../types';

interface VariantRule {
  matchRegex: RegExp;
  groupTitle: string;
  extractVariantName: (title: string) => string;
  groupDescription?: string;
}

const VARIANT_RULES: VariantRule[] = [
  // 1. Busos Escolares (Buso Escolar 4 - 8, 10 - 12, 14 - 16, S - L, XL)
  {
    matchRegex: /^Buso Escolar\s+/i,
    groupTitle: 'Buso Escolar',
    extractVariantName: (title) => {
      const clean = title.replace(/^Buso Escolar\s+/i, '').trim();
      if (clean === '4 - 8') return 'Talla 4 - 8 (Tallas 4, 6 y 8)';
      if (clean === '10 - 12') return 'Talla 10 - 12 (Tallas 10 y 12)';
      if (clean === '14 - 16') return 'Talla 14 - 16 (Tallas 14 y 16)';
      if (clean.toLowerCase() === 's - l') return 'Talla S - L (Tallas S, M y L)';
      if (clean.toUpperCase() === 'XL') return 'Talla XL';
      return clean.toLowerCase().startsWith('talla') ? clean : `Tallas ${clean}`;
    },
    groupDescription:
      'Pantalón deportivo escolar con cintura elástica, cordón ajustable y costuras reforzadas para educación física.',
  },
  // 2. Camisa Escolar Bondi (Camisa Escolar Bondi 2 - 8, 10 - 18, S - L)
  {
    matchRegex: /^Camisa Escolar Bondi\s+/i,
    groupTitle: 'Camisa Escolar Bondi',
    extractVariantName: (title) => {
      const clean = title.replace(/^Camisa Escolar Bondi\s+/i, '').trim();
      if (clean === '2 - 8') return 'Talla 2 - 8 (Tallas 2 a 8)';
      if (clean === '10 - 18') return 'Talla 10 - 18 (Tallas 10 a 18)';
      if (clean.toLowerCase() === 's - l') return 'Talla S - L (Tallas S, M y L)';
      return clean.toLowerCase().startsWith('talla') ? clean : `Tallas ${clean}`;
    },
    groupDescription:
      'Camisa escolar confeccionada en tela Bondi de alta resistencia, botones reforzados y cuello formal para uniforme.',
  },
  // 3. Camisa Blanca Sublimable (Infantil, Juvenil, Adulto, Tallas Grandes)
  {
    matchRegex: /^Camisa Blanca\s+/i,
    groupTitle: 'Camisa Blanca Sublimable',
    extractVariantName: (title) => {
      return title.replace(/^Camisa Blanca\s+/i, '').trim();
    },
    groupDescription:
      'Camisa de tacto algodón 100% poliéster especial para sublimación fotográfica a todo color. Excelente durabilidad y nitidez.',
  },
];

/**
 * Groups multiple single-size/single-model products into a single card with variants
 * strictly preserving the original catalog position and sort order (never moving them to the top).
 */
export function groupProductsWithVariants(
  products: Product[],
  searchQuery?: string
): Product[] {
  if (!Array.isArray(products) || products.length === 0) return [];

  // 1. Identify which products belong to which variant rule
  const ruleGroups = new Map<string, { rule: VariantRule; items: Product[]; firstIndex: number }>();

  products.forEach((p, idx) => {
    // If product already has configured variants, treat as standalone
    if (p.variants && p.variants.length > 1) return;

    for (const rule of VARIANT_RULES) {
      if (rule.matchRegex.test(p.title)) {
        if (!ruleGroups.has(rule.groupTitle)) {
          ruleGroups.set(rule.groupTitle, { rule, items: [], firstIndex: idx });
        }
        ruleGroups.get(rule.groupTitle)!.items.push(p);
        break;
      }
    }
  });

  const handledGroups = new Set<string>();
  const result: Product[] = [];

  // 2. Iterate in EXACT original catalog order
  for (const p of products) {
    let matchedGroupTitle: string | null = null;
    let matchedRule: VariantRule | null = null;

    if (!p.variants || p.variants.length <= 1) {
      for (const rule of VARIANT_RULES) {
        if (rule.matchRegex.test(p.title)) {
          matchedGroupTitle = rule.groupTitle;
          matchedRule = rule;
          break;
        }
      }
    }

    if (matchedGroupTitle && matchedRule) {
      // If we already placed the unified group for this family, skip subsequent individual items
      if (handledGroups.has(matchedGroupTitle)) {
        continue;
      }
      handledGroups.add(matchedGroupTitle);

      const groupData = ruleGroups.get(matchedGroupTitle)!;
      if (groupData.items.length <= 1) {
        result.push(p);
        continue;
      }

      // Enrich variants with their size/variant label
      const variants: Product[] = groupData.items.map((item) => ({
        ...item,
        variantName: item.variantName || matchedRule!.extractVariantName(item.title),
      }));

      // Sort variants logically by price
      variants.sort((a, b) => a.price - b.price);

      // If there is an active search query, focus on matching variant
      let initialIndex = 0;
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchIdx = variants.findIndex(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            (v.variantName && v.variantName.toLowerCase().includes(q))
        );
        if (matchIdx >= 0) initialIndex = matchIdx;
      }

      const first = variants[initialIndex] || variants[0];
      const anyInStock = variants.some((v) => v.inStock !== false);

      // Place the grouped product at its EXACT original position in the catalog
      result.push({
        ...first,
        id: `interactive-${first.id}`,
        title: matchedGroupTitle,
        description: matchedRule.groupDescription || first.description,
        inStock: anyInStock,
        badge: first.badge || undefined, // Strictly never hardcode "5 Tallas"
        variantName: first.variantName,
        variants,
        activeVariantIndex: initialIndex,
      });
    } else {
      result.push(p);
    }
  }

  return result;
}
