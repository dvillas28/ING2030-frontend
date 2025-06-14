export function recommendProducts(user, transactions = []) {
    const recs = [];
    const totalExpenses = transactions
        .filter(t => t.type === 'cargo')
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const totalDeposits = transactions
        .filter(t => t.type === 'deposito')
        .reduce((s, t) => s + Number(t.amount), 0);

    // 1. Cuenta corriente sin costo
    if ( totalDeposits > 100000 && user.balance > 0) {
        recs.push({
            title: "Cuenta Corriente sin Mantención",
            description: "Cuenta gratuita sin requisitos, incluye tarjeta crédito y débito.",
            link: "https://ww2.itau.cl/personas/cuenta-corriente",
            productId: "cuenta-corriente-costo0"
        });
    }

    // 2. Inversión
    if (user.balance > 500000 || totalExpenses < 0.5 * totalDeposits) {
        recs.push({
            title: "Invierte en Fondos Mutuos",
            description: "Invierte a través de la Plataforma Abierta de Inversiones de Itaú.",
            link: "https://www.itau.cl/empresas/fondos-mutuos",
            productId: "fondos-mutuos"
        });
    }

    // 3. Línea de crédito de emergencia si el balance es negativo
    if (user.spent > user.balance) {
        recs.push({
            title: "Línea de Crédito de Emergencia",
            description: "¿Saldo negativo? Obtén una línea de crédito de $100.000 para cubrir gastos urgentes.",
            link: "https://banco.itau.cl/wps/wcm/connect/es_contentsbic/bic_public/home/para_usted/linea_credito/linea_preferencial/linea+de+credito",
            productId: "linea-credito-emergencia"
        });
    }

    return recs;
}
