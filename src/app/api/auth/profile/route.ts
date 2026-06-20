import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, hashPassword, verifyPassword } from "@/lib/auth-server";
import { validate, profileUpdateSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function PUT(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { name, email, currentPassword, newPassword, vehicleType, vehicleSize, vehicleMake, vehicleModel, licensePlate } = validate(profileUpdateSchema, await req.json());

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return err("User not found", 404);
    }

    const updates: Record<string, string | null> = {};
    const now = new Date().toISOString();

    if (name) updates.name = name;

    if (email && email !== user.email) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing) {
        return err("Email already in use", 409);
      }
      updates.email = email;
    }

    if (vehicleType !== undefined) updates.vehicleType = vehicleType;
    if (vehicleSize !== undefined) updates.vehicleSize = vehicleSize;
    if (vehicleMake !== undefined) updates.vehicleMake = vehicleMake === "" ? null : vehicleMake;
    if (vehicleModel !== undefined) updates.vehicleModel = vehicleModel === "" ? null : vehicleModel;
    if (licensePlate !== undefined) updates.licensePlate = licensePlate === "" ? null : licensePlate;

    if (newPassword) {
      if (!currentPassword) {
        return err("Current password is required to set a new password", 400);
      }
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return err("Current password is incorrect", 403);
      }
      updates.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return err("No fields to update", 400);
    }

    updates.updatedAt = now;

    await db.update(users).set(updates).where(eq(users.id, session.userId));

    const [updated] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const { passwordHash: _, ...safeUser } = updated;
    return ok({ user: safeUser });
  } catch (error) {
    return handleError(error, "Profile update error");
  }
}
