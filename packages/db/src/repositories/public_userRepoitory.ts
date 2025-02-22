import { eq } from "drizzle-orm";

import { db as _db } from "../client";
import { invitations } from "../schema";

export function public_userRepositoryFactory() {
  async function deleteInvitationById(db = _db, id: string) {
    await db.delete(invitations).where(eq(invitations.id, id));
  }

  async function findInvitationById(id: string, db = _db) {
    return db.query.invitations.findFirst({
      where: (invitation, { eq }) => eq(invitation.id, id),
    });
  }

  return {
    deleteInvitationById,
    findInvitationById,
  };
}
