import type { z } from "zod";
import { eq, gt, gte, lt, lte } from "drizzle-orm";

import { kodixCareAppId } from "@kdx/shared";

import type { Update } from "../../_types";
import type {
  zCareShiftCreate,
  zCareShiftUpdate,
} from "../../_zodSchemas/careShiftSchemas";
import type { teamRepositoryFactory } from "../../teamRepository";
import { db as _db } from "../../../client";
import { careShifts } from "../../../schema";
import { assertTeamIdInList, createWithinTeamsForTable } from "../../utils";

export function kodixCareRepositoryFactory(
  teamIds: string[],
  {
    teamRepository,
  }: {
    teamRepository: ReturnType<typeof teamRepositoryFactory>;
  },
) {
  const withinTeams = createWithinTeamsForTable(teamIds, careShifts);

  async function updateCareShift(
    { id, input }: Update<typeof zCareShiftUpdate>,
    db = _db,
  ) {
    return db
      .update(careShifts)
      .set(input)
      .where(withinTeams(eq(careShifts.id, id)));
  }

  async function getCareShiftById(id: string, db = _db) {
    return db.query.careShifts.findFirst({
      where: withinTeams(eq(careShifts.id, id)),
    });
  }

  async function createCareShift(
    careShift: z.infer<typeof zCareShiftCreate>,
    db = _db,
  ) {
    assertTeamIdInList(careShift, teamIds);
    return db.insert(careShifts).values(careShift).$returningId();
  }

  async function deleteCareShiftById(id: string, db = _db) {
    return db.delete(careShifts).where(withinTeams(eq(careShifts.id, id)));
  }

  async function getAllCareGivers(teamId: string, db = _db) {
    const users = await teamRepository.getUsersWithRoles(
      {
        appId: kodixCareAppId,
      },
      db,
    );

    return users.filter((user) =>
      user.UserTeamAppRoles.some((role) => role.role === "CAREGIVER"),
    );
  }

  async function findOverlappingShifts(
    {
      teamId,
      start,
      end,
      inclusive = false,
    }: {
      teamId: string;
      start: Date;
      end: Date;
      inclusive?: boolean;
    },
    db = _db,
  ) {
    const startCondition = inclusive ? gte : gt;
    const endCondition = inclusive ? lte : lt;

    return db.query.careShifts.findMany({
      where: (careShifts, { and }) =>
        and(
          eq(careShifts.teamId, teamId),
          startCondition(careShifts.endAt, start),
          endCondition(careShifts.startAt, end),
        ),
      with: {
        Caregiver: {
          columns: {
            id: true,
            image: true,
            name: true,
          },
        },
      },
      columns: {
        id: true,
        startAt: true,
        endAt: true,
      },
    });
  }

  return {
    updateCareShift,
    getCareShiftById,
    createCareShift,
    deleteCareShiftById,
    getAllCareGivers,
    findOverlappingShifts,
  };
}
