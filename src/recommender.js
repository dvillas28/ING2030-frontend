export function recommendProducts(user, transactions = []) {
    const recs = [];
    const totalExpenses = transactions
        .filter(t => t.type === 'cargo')
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const totalDeposits = transactions
        .filter(t => t.type === 'deposito')
        .reduce((s, t) => s + Number(t.amount), 0);

    // 1. Cuenta corriente sin costo
    if (totalDeposits > 100000 && user.balance > 0) {
        recs.push({
            title: "Cuenta Corriente sin Mantención",
            description: "Cuenta gratuita sin requisitos, incluye tarjeta crédito y débito.",
            link: "https://ww2.itau.cl/personas/cuenta-corriente",
            productId: "cuenta-corriente-costo0"
        });
    }

    // 2. Inversión
    if (user.balance > 300000 || totalExpenses < 0.5 * totalDeposits) {
        recs.push({
            title: "Invierte en Fondos Mutuos",
            description: "Invierte a través de la Plataforma Abierta de Inversiones de Itaú.",
            link: "https://www.itau.cl/personas/inversiones/fondos-mutuos",
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

    // 4. Depósito a Plazo
    if (user.balance > 200000) {
        recs.push({
            title: "Depósito a Plazo",
            description: "Ahorra de forma segura y obtén rentabilidad con un depósito a plazo.",
            link: "https://www.itau.cl/personas/inversiones/depositos-a-plazo",
            productId: "deposito-a-plazo"
        });
    }
    //5. Ahorro Previsional Voluntario
    if (user.balance > 500000) {
        recs.push({
            title: "Ahorro Previsional Voluntario",
            description: "Mejora o adelanta tu jubilación, aprovechando beneficios tributarios con tu APV.",
            link: "https://www.itau.cl/personas/inversiones/ahorro-previsional-voluntario",
            productId: "ahorro-previosional-voluntario"
        });
    }

    return recs;
}
