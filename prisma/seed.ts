import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deletando dados antigos...");
  await prisma.transaction.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.fixedExpense.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.cardInvoice.deleteMany();
  await prisma.income.deleteMany();
  await prisma.card.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Criando usuário padrão...");
  const user = await prisma.user.create({
    data: {
      name: "Usuário Teste",
      email: "teste@example.com",
    }
  });

  console.log("Criando categorias...");
  const catBills = await prisma.category.create({
    data: { name: "Contas Fixas", color: "#eebefa", icon: "Home", allocationPercentage: 40.0, userId: user.id },
  });
  const catFood = await prisma.category.create({
    data: { name: "Alimentação", color: "#ffc9c9", icon: "Utensils", allocationPercentage: 25.0, userId: user.id },
  });
  const catLeisure = await prisma.category.create({
    data: { name: "Lazer", color: "#ffd8a8", icon: "Smile", allocationPercentage: 15.0, userId: user.id },
  });
  await prisma.category.create({
    data: { name: "Investimentos/Reserva", color: "#b2f2bb", icon: "TrendingUp", allocationPercentage: 20.0, userId: user.id },
  });
  const catShopping = await prisma.category.create({
    data: { name: "Compras", color: "#d0ebff", icon: "ShoppingBag", allocationPercentage: 0.0, userId: user.id },
  });
  const catOthers = await prisma.category.create({
    data: { name: "Outros", color: "#e9ecef", icon: "DollarSign", allocationPercentage: 0.0, userId: user.id },
  });

  console.log("Criando cartões...");
  const cardNubank = await prisma.card.create({
    data: {
      name: "Nubank",
      limit: 5000.0,
      closingDay: 5,
      dueDay: 10,
      color: "#8a05be",
      userId: user.id,
    },
  });
  const cardXP = await prisma.card.create({
    data: {
      name: "XP Visa Infinite",
      limit: 10000.0,
      closingDay: 15,
      dueDay: 25,
      color: "#000000",
      userId: user.id,
    },
  });

  console.log("Criando receitas...");
  // Receita principal para gastos comuns
  await prisma.income.create({
    data: {
      description: "Salário Principal",
      amount: 5500.0,
      isRecurring: true,
      date: new Date("2026-06-01T00:00:00.000Z"),
      userId: user.id,
    },
  });
  // Receita reservada para investimento
  await prisma.income.create({
    data: {
      description: "Freelance Design",
      amount: 1200.0,
      isRecurring: false,
      date: new Date("2026-06-05T00:00:00.000Z"),
      userId: user.id,
    },
  });
  // Outra receita de investimentos
  await prisma.income.create({
    data: {
      description: "Rendimento FIIs",
      amount: 300.0,
      isRecurring: true,
      date: new Date("2026-06-08T00:00:00.000Z"),
      userId: user.id,
    },
  });

  console.log("Criando despesas fixas...");
  await prisma.fixedExpense.create({
    data: {
      description: "Aluguel & Condomínio",
      amount: 1600.0,
      variationMargin: 0.0,
      dueDay: 10,
      categoryId: catBills.id,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      userId: user.id,
    },
  });
  await prisma.fixedExpense.create({
    data: {
      description: "Energia Elétrica (Enel)",
      amount: 180.0,
      variationMargin: 15.0, // varia +/- 15%
      dueDay: 15,
      categoryId: catBills.id,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      userId: user.id,
    },
  });
  await prisma.fixedExpense.create({
    data: {
      description: "Assinatura Netflix",
      amount: 55.9,
      variationMargin: 0.0,
      dueDay: 20,
      categoryId: catLeisure.id,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      userId: user.id,
    },
  });
  await prisma.fixedExpense.create({
    data: {
      description: "Internet Banda Larga",
      amount: 120.0,
      variationMargin: 0.0,
      dueDay: 8,
      categoryId: catBills.id,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      userId: user.id,
    },
  });

  console.log("Criando dívidas...");
  await prisma.debt.create({
    data: {
      description: "IPTU",
      amount: 210.0,
      isRecurring: true,
      date: new Date("2026-06-01T00:00:00.000Z"),
      dueDay: 12,
      categoryId: catBills.id,
      userId: user.id,
    },
  });
  await prisma.debt.create({
    data: {
      description: "Consulta médica parcelada fora do cartão",
      amount: 320.0,
      isRecurring: false,
      date: new Date("2026-06-18T00:00:00.000Z"),
      categoryId: catOthers.id,
      userId: user.id,
    },
  });

  console.log("Criando parcelamentos...");
  const instLaptop = await prisma.installment.create({
    data: {
      description: "Notebook MacBook Air",
      totalAmount: 6000.0,
      totalInstallments: 10,
      currentInstallment: 3, // já pagou 2 parcelas, esta é a 3ª
      amountPerInstallment: 600.0,
      startDate: new Date("2026-04-10T00:00:00.000Z"),
      cardId: cardNubank.id,
      categoryId: catShopping.id,
      userId: user.id,
    },
  });

  const instGym = await prisma.installment.create({
    data: {
      description: "Plano Anual Academia",
      totalAmount: 1200.0,
      totalInstallments: 12,
      currentInstallment: 6,
      amountPerInstallment: 100.0,
      startDate: new Date("2026-01-15T00:00:00.000Z"),
      cardId: cardXP.id,
      categoryId: catOthers.id,
      userId: user.id,
    },
  });

  console.log("Criando transações reais...");
  // Transações de débito / conta corrente normais
  await prisma.transaction.create({
    data: {
      description: "Supermercado Extra",
      amount: 245.5,
      type: "OUTFLOW",
      date: new Date("2026-06-03T14:30:00.000Z"),
      categoryId: catFood.id,
      userId: user.id,
    },
  });
  await prisma.transaction.create({
    data: {
      description: "Jantar Pizzaria",
      amount: 110.0,
      type: "OUTFLOW",
      date: new Date("2026-06-06T20:00:00.000Z"),
      categoryId: catFood.id,
      userId: user.id,
    },
  });
  await prisma.transaction.create({
    data: {
      description: "Uber Cinema",
      amount: 35.0,
      type: "OUTFLOW",
      date: new Date("2026-06-07T18:15:00.000Z"),
      categoryId: catLeisure.id,
      userId: user.id,
    },
  });

  // Transações do cartão de crédito (Nubank - Fatura de Junho)
  await prisma.transaction.create({
    data: {
      description: "Notebook MacBook Air (Parcela 3/10)",
      amount: 600.0,
      type: "OUTFLOW",
      date: new Date("2026-06-10T12:00:00.000Z"), // cai na fatura
      categoryId: catShopping.id,
      cardId: cardNubank.id,
      installmentId: instLaptop.id,
      userId: user.id,
    },
  });
  await prisma.transaction.create({
    data: {
      description: "Restaurante Japonês",
      amount: 150.0,
      type: "OUTFLOW",
      date: new Date("2026-06-02T21:30:00.000Z"), // antes do fechamento dia 5
      categoryId: catFood.id,
      cardId: cardNubank.id,
      userId: user.id,
    },
  });

  // Transações do cartão XP (Fatura de Junho - vence dia 25, fecha dia 15)
  await prisma.transaction.create({
    data: {
      description: "Plano Anual Academia (Parcela 6/12)",
      amount: 100.0,
      type: "OUTFLOW",
      date: new Date("2026-06-15T09:00:00.000Z"),
      categoryId: catOthers.id,
      cardId: cardXP.id,
      installmentId: instGym.id,
      userId: user.id,
    },
  });

  console.log("Criando valores reais de faturas...");
  // Cadastrar a fatura real fechada de Nubank em Maio
  await prisma.cardInvoice.create({
    data: {
      cardId: cardNubank.id,
      month: 5,
      year: 2026,
      realAmount: 750.0,
      status: "PAGA",
      userId: user.id,
    },
  });
  // Cadastrar a fatura estimada/real para Nubank em Junho
  await prisma.cardInvoice.create({
    data: {
      cardId: cardNubank.id,
      month: 6,
      year: 2026,
      realAmount: 750.0, // Usuário cadastrou o valor que viu no app da Nubank
      status: "FECHADA",
      userId: user.id,
    },
  });

  console.log("Banco de dados populado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
