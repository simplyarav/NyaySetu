import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { transitionCaseState } from "@/lib/caseStateMachine";

export async function PATCH(req, { params }) {
  try {
    const user = requireRole(["clerk", "judge", "admin"]);
    if (user instanceof NextResponse) return user;

    const { id } = params;
    const body = await req.json();
    const { newStatus, reason } = body;

    if (!newStatus) {
      return NextResponse.json({ error: "newStatus is required" }, { status: 400 });
    }

    const result = await transitionCaseState({
      caseId: id,
      newStatus,
      actor: { _id: user.id, role: user.role },
      reason,
      action: "kanban_drag"
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ message: "Status updated successfully", newStatus: result.newStatus });
  } catch (error) {
    console.error("PATCH status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
