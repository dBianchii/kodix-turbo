import type { Drizzle } from "@cash/db/client";
import {
  DISCOUNTED_CASHBACK_PERCENT,
  FULL_CASHBACK_PERCENT,
  MONTHS_TO_EXPIRE_CASHBACK,
} from "@cash/api/constants";
import * as schema from "@cash/db/schema";
import { generatePasswordHash } from "@kodix/auth/core";
import dayjs from "@kodix/dayjs";
import { nanoid } from "@kodix/shared/utils";
import { getGeneratorsFunctions, seed } from "drizzle-seed";

const DEV_USER = { email: "dev@user.com", password: "asdfasdf" };

const SEED_NUMBER = 12_345;

const {
  caTokens: _caTokens,
  accounts: _accounts,
  sessions: _sessions,
  cashbacks: _cashbacks,
  vouchers: _vouchers,
  voucherCashbacks: _voucherCashbacks,
  ...schemaToSeed
} = schema;

// Initialize generators
const generators = getGeneratorsFunctions();

function createGenerator<T>(
  generator: {
    init: (params: { count: number; seed: number }) => void;
    generate: (params: { i: number }) => T;
  },
  count: number,
) {
  generator.init({ count, seed: SEED_NUMBER });
  let i = 0;
  return () => generator.generate({ i: i++ }) as T;
}

export async function seedCash(db: Drizzle) {
  const passwordHash = await generatePasswordHash(DEV_USER.password);

  const clientsCount = 300;
  const salesCount = 1500;
  const usersCount = 1;

  await seed(db, schemaToSeed, { seed: SEED_NUMBER }).refine((g) => ({
    clients: {
      columns: {
        bairro: g.streetAddress(),
        caId: g.uuid(),
        cep: g.phoneNumber({ template: "########" }),
        cidade: g.city(),
        document: g.phoneNumber({ template: "###########" }),
        email: g.email(),
        estado: g.valuesFromArray({
          values: ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "GO"],
        }),
        id: g.valuesFromArray({
          isUnique: true,
          values: Array.from({ length: clientsCount }, () => nanoid()),
        }),
        logradouro: g.streetAddress(),
        name: g.fullName(),
        numero: g.int({ maxValue: 9999, minValue: 1 }),
        pais: g.default({ defaultValue: "Brasil" }),
        phone: g.phoneNumber({ template: "+55###########" }),
        registeredFromFormAt: g.weightedRandom([
          { value: g.default({ defaultValue: null }), weight: 0.6 },
          {
            value: g.date({
              maxDate: dayjs().format("YYYY-MM-DD"),
              minDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
            }),
            weight: 0.4,
          },
        ]),
        type: g.default({ defaultValue: "Física" }),
      },
      count: clientsCount,
      with: {
        sales: [
          { count: [1, 2], weight: 0.6 },
          { count: [3, 4, 5], weight: 0.4 },
        ],
      },
    },
    sales: {
      columns: {
        caCreatedAt: g.date({
          maxDate: dayjs().format("YYYY-MM-DD"),
          minDate: dayjs().subtract(6, "months").format("YYYY-MM-DD"),
        }),
        caId: g.uuid(),
        caNumero: g.int({ isUnique: true, minValue: 1 }),
        id: g.valuesFromArray({
          isUnique: true,
          values: Array.from({ length: salesCount }, () => nanoid()),
        }),
        total: g.weightedRandom([
          {
            value: g.number({ maxValue: 100, minValue: 10, precision: 2 }),
            weight: 0.7,
          },
          {
            value: g.number({ maxValue: 300, minValue: 100, precision: 2 }),
            weight: 0.25,
          },
          {
            value: g.number({ maxValue: 1100, minValue: 300, precision: 2 }),
            weight: 0.05,
          },
        ]),
      },
    },
    users: {
      columns: {
        email: g.default({ defaultValue: DEV_USER.email }),
        id: g.valuesFromArray({
          isUnique: true,
          values: Array.from({ length: usersCount }, () => nanoid()),
        }),
        isAdmin: g.default({ defaultValue: true }),
        name: g.default({ defaultValue: "Dev User" }),
        passwordHash: g.default({ defaultValue: passwordHash }),
      },
      count: usersCount,
    },
  }));

  const sales = await db.query.sales.findMany();

  // Estimate counts for generator initialization
  const estimatedCashbacks = sales.length * 3; // avg 3 cashbacks per sale

  // Create generators using drizzle-seed functions
  const genNumCashbacks = createGenerator(
    generators.int({ maxValue: 3, minValue: 1 }),
    sales.length,
  );
  const genCashbackPercent = createGenerator(
    generators.weightedRandom([
      {
        value: generators.default({ defaultValue: FULL_CASHBACK_PERCENT }),
        weight: 0.8,
      },
      {
        value: generators.default({
          defaultValue: DISCOUNTED_CASHBACK_PERCENT,
        }),
        weight: 0.2,
      },
    ]),
    estimatedCashbacks,
  );
  const genItemRatio = createGenerator(
    generators.number({ maxValue: 0.6, minValue: 0.2, precision: 2 }),
    estimatedCashbacks,
  );

  const genUuid = createGenerator(generators.uuid(), estimatedCashbacks);

  const cashbacksToInsert: (typeof schema.cashbacks.$inferInsert)[] = [];

  for (const sale of sales) {
    // Each sale has 1-3 cashback items (products)
    const numCashbacks = Number(genNumCashbacks());
    let remainingTotal = sale.total;

    for (let j = 0; j < numCashbacks; j++) {
      const isLastItem = j === numCashbacks - 1;
      const itemRatio = Number(genItemRatio());
      const itemValue = isLastItem
        ? remainingTotal
        : Math.round(remainingTotal * itemRatio * 100) / 100;

      remainingTotal -= itemValue;

      const cashbackPercent = Number(genCashbackPercent());
      const cashbackAmount =
        Math.round(itemValue * (cashbackPercent / 100) * 100) / 100;

      const expiresAt = dayjs(sale.caCreatedAt)
        .add(MONTHS_TO_EXPIRE_CASHBACK, "months")
        .toISOString();

      cashbacksToInsert.push({
        amount: cashbackAmount,
        caProductId: genUuid(),
        clientId: sale.clientId,
        expiresAt,
        saleId: sale.id,
      });
    }
  }

  await db.insert(schema.cashbacks).values(cashbacksToInsert);
}
