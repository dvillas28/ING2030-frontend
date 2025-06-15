const categorias = [
  { categoria: 'Comida', keywords: ['fork', 'starbucks', 'kfc', 'mcdonald', 'heladeria', 'plaza v','comida', 'restaurant', 'delivery', 'ACHOCLONADOS', 'pronto' ] },
  { categoria: 'Transporte', keywords: ['pasajebus', 'tur-bus', 'uber', 'cabify', 'metro', 'bip', 'combustible', 'bencina', 'taxi', 'bus'] },
  { categoria: 'Supermercado', keywords:  ['sumup', 'vendomatica', 'tienda', 'maxik', 'acho' ,'supermercado', 'líder', 'jumbo', 'tottus', 'unimarc', 'santa isabel'] },
  { categoria: 'Educación', keywords: ['servicios y', 'uc'] },
  { categoria: 'Salud', keywords: ['farmacia', 'doctor', 'salud', 'isapre', 'consulta', 'MEDIC'] },
  { categoria: 'Entretenimiento', keywords: ['cine', 'netflix', 'spotify', 'disney', 'juegos'] },
  { categoria: 'Vivienda', keywords: ['arriendo', 'dividendo', 'cuenta luz', 'cuenta agua', 'gasto común', 'SANTA ISABEL'] },
  { categoria: 'Ingresos', keywords: ['depósito', 'abono', 'tef de', 'abono convenio', 'tgr', 'devocion'] },
  { categoria: 'Pago a Terceros', keywords: ['terceros']}
];

export function categorizeTransaction(description) {
  const lowerDesc = description.toLowerCase();

  for (const item of categorias) {
    if (item.keywords.some(keyword => lowerDesc.includes(keyword))) {
      return item.categoria;
    }
  }

  return 'Otros';
}