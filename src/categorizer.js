const baseCategorias = [
  { categoria: 'Comida', keywords: ['fork', 'starbucks', 'kfc', 'mcdonald', 'heladeria', 'plaza v', 'comida', 'restaurant', 'delivery', 'ACHOCLONADOS', 'pronto'] },
  { categoria: 'Transporte', keywords: ['pasajebus', 'tur-bus', 'uber', 'cabify', 'metro', 'bip', 'combustible', 'bencina', 'taxi', 'bus'] },
  { categoria: 'Supermercado', keywords: ['sumup', 'vendomatica', 'tienda', 'maxik', 'acho', 'supermercado', 'líder', 'jumbo', 'tottus', 'unimarc', 'santa isabel'] },
  { categoria: 'Educación', keywords: ['servicios y', 'uc'] },
  { categoria: 'Salud', keywords: ['farmacia', 'doctor', 'salud', 'isapre', 'consulta', 'MEDIC'] },
  { categoria: 'Entretenimiento', keywords: ['cine', 'netflix', 'spotify', 'disney', 'juegos'] },
  { categoria: 'Vivienda', keywords: ['arriendo', 'dividendo', 'cuenta luz', 'cuenta agua', 'gasto común', 'SANTA ISABEL'] },
  { categoria: 'Ingresos', keywords: ['depósito', 'abono', 'tef de', 'abono convenio', 'tgr', 'devocion'] },
  { categoria: 'Pago a Terceros', keywords: ['terceros'] }
];

export function categorizeTransaction(description) {
  const lowerDesc = description.toLowerCase();

  // Leer categorías del localStorage
  const stored = JSON.parse(localStorage.getItem('categorias') || '[]');

  // Unir sin duplicar categorías (si hay una igual, combinamos los keywords)
  const categoriasMap = new Map();

  // Primero cargamos las base
  baseCategorias.forEach(cat => {
    categoriasMap.set(cat.categoria, new Set(cat.keywords.map(k => k.toLowerCase())));
  });

  // Luego las del localStorage (agregan o expanden)
  stored.forEach(cat => {
    const lowerKeywords = cat.keywords.map(k => k.toLowerCase());
    if (categoriasMap.has(cat.categoria)) {
      const existingSet = categoriasMap.get(cat.categoria);
      lowerKeywords.forEach(k => existingSet.add(k));
    } else {
      categoriasMap.set(cat.categoria, new Set(lowerKeywords));
    }
  });

  // Buscar coincidencia
  for (const [categoria, keywordsSet] of categoriasMap) {
    for (const keyword of keywordsSet) {
      if (lowerDesc.includes(keyword)) {
        return categoria;
      }
    }
  }

  return 'Otros';
}
