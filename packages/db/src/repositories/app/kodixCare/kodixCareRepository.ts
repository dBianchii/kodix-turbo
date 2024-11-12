import type { z } from "zod";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareShiftCreate,
  zCareShiftUpdate,
} from "../../_zodSchemas/careShiftSchemas";
import type { DrizzleTeam, DrizzleTransaction } from "../../../client";
import { careShifts } from "../../../schema";

export const getKodixCareRepository = (_teamDb: DrizzleTeam) => ({
  async getCurrentCareShift(
    teamDb: DrizzleTransaction | DrizzleTeam = _teamDb,
  ) {
    const shift = await teamDb.query.careShifts.findFirst({
      orderBy: desc(careShifts.checkIn),
      with: {
        Caregiver: {
          columns: {
            email: true,
            id: true,
            image: true,
            name: true,
          },
        },
      },
      columns: {
        shiftEndedAt: true,
        checkIn: true,
        checkOut: true,
        id: true,
      },
    });
    return shift ?? null;
  },

  async getAllCareShifts(teamDb: DrizzleTransaction | DrizzleTeam = _teamDb) {
    return await teamDb.query.careShifts.findMany({
      orderBy: [asc(careShifts.checkIn)],
      with: {
        Caregiver: {
          columns: {
            image: true,
            name: true,
          },
        },
      },
    });
  },

  async updateCareShift(
    { id, input }: Update<typeof zCareShiftUpdate>,
    teamDb: DrizzleTransaction | DrizzleTeam = _teamDb,
  ) {
    await teamDb.update(careShifts).set(input).where(eq(careShifts.id, id));
  },

  async createCareShift(
    careShift: z.infer<typeof zCareShiftCreate>,
    teamDb: DrizzleTransaction | DrizzleTeam = _teamDb,
  ) {
    return teamDb.insert(careShifts).values(careShift).$returningId();
  },

  async getPreviousShift(teamDb: DrizzleTransaction | DrizzleTeam = _teamDb) {
    return await teamDb.query.careShifts.findFirst({
      orderBy: desc(careShifts.checkIn),
      where: and(isNotNull(careShifts.shiftEndedAt)),
      columns: { id: true },
    });
  },
});
