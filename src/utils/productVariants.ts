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
      return clean.startsWith('Talla') ? clean : `Talla ${clean}`;
    },
    groupDescription: 'Pantalón deportivo escolar con cintura elástica, cordón ajustable y costuras reforzadas para educación física. Disponible en 5 tallas escolares y juveniles.',
  },
  // 2. Camisa Escolar Bondi (Camisa Escolar Bondi 2 - 8, 10 - 18, S - L)
  {
    matchRegex: /^Camisa Escolar Bondi\s+/i,
    groupTitle: 'Camisa Escolar Bondi',
    extractVariantName: (title) => {
      const clean = title.replace(/^Camisa Escolar Bondi\s+/i, '').trim();
      return clean.startsWith('Talla') ? clean : `Talla ${clean}`;
    },
    groupDescription: 'Camisa escolar confeccionada en tela Bondi de alta resistencia, botones reforzados y cuello formal para uniforme.',
  },
  // 3. Camisa Blanca Sublimable (Infantil, Juvenil, Adulto, Tallas Grandes)
  {
    matchRegex: /^Camisa Blanca\s+/i,
    groupTitle: 'Camisa Blanca Sublimable',
    extractVariantName: (title) => {
      const clean = title.replace(/^Camisa Blanca\s+/i, '').trim();
      return clean;
    },
    groupDescription: 'Camisa de tacto algodón 100% poliéster especial para sublimación fotográfica a todo color. Excelente durabilidad y nitidez.',
  },
];

/**
 * Groups multiple single-size/single-model products into interactive cards with variants.
 * For example: 5 separate "Buso Escolar" items become 1 interactive card where
 * the customer can slide/swipe and pick between all 5 sizes directly inside the card.
 */
export function groupProductsWithVariants(
  products: Product[],
  searchQuery?: string
): Product[] {
  if (!Array.isArray(products) || products.length === 0) return [];

  // Track products that belong to a detected variant rule
  const groupedBuckets: Record<
    string,
    {
      rule: VariantRule;
      items: Product[];
    }
  > = {};

  const unassigned: Product[] = [];

  products.forEach((p) => {
    // If product already has configured variants, keep it as is
    if (p.variants && p.variants.length > 1) {
      unassigned.push(p);
      return;
    }

    let matchedRule: VariantRule | null = null;
    for (const rule of VARIANT_RULES) {
      if (rule.matchRegex.test(p.title)) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      if (!groupedBuckets[matchedRule.groupTitle]) {
        groupedBuckets[matchedRule.groupTitle] = {
          rule: matchedRule,
          items: [],
        };
      }
      groupedBuckets[matchedRule.groupTitle].items.push(p);
    } else {
      unassigned.push(p);
    }
  });

  const consolidated: Product[] = [];

  // Consolidate groups into single interactive products
  Object.entries(groupedBuckets).forEach(([groupTitle, { rule, items }]) => {
    if (items.length <= 1) {
      // If only 1 item in group, leave it as standalone
      consolidated.push(...items);
      return;
    }

    // Enrich each variant with its variantName
    const variants: Product[] = items.map((item) => ({
      ...item,
      variantName: item.variantName || rule.extractVariantName(item.title),
    }));

    // Sort variants logically (e.g. by price or size numbers)
    variants.sort((a, b) => a.price - b.price);

    // If there is an active search query, see if one variant specifically matches
    let initialIndex = 0;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchIdx = variants.findIndex(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.variantName && v.variantName.toLowerCase().includes(q))
      );
      if (matchIdx >= 0) {
        initialIndex = matchIdx;
      }
    }

    const first = variants[initialIndex] || variants[0];
    const anyInStock = variants.some((v) => v.inStock !== false);

    // Create the master interactive product
    const interactiveProduct: Product = {
      ...first,
      id: `interactive-${first.id}`,
      title: groupTitle,
      description: rule.groupDescription || first.description,
      inStock: anyInStock,
      badge: `${variants.length} Tallas`,
      variantName: first.variantName,
      variants,
      activeVariantIndex: initialIndex,
    };

    consolidated.push(interactiveProduct);
  });

  // Combine consolidated groups with standalone products
  // Maintain catalog order: place grouped products around where their first item was
  return [...consolidated, ...unassigned];
}
