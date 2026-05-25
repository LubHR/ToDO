'use server';

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    return await db.todo.findMany({
      where: { userId: user.id },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
}

export async function addTodo(title: string) {
  if (!title || title.trim() === "") return;
  const user = await getCurrentUser();
  if (!user) return;

  try {
    // Find the minimum order to insert the new task at the top
    const firstTodo = await db.todo.findFirst({
      where: { userId: user.id },
      orderBy: { order: "asc" },
    });
    const newOrder = firstTodo ? firstTodo.order - 1 : 0;

    await db.todo.create({
      data: {
        title: title.trim(),
        order: newOrder,
        userId: user.id,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to add todo:", error);
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    await db.todo.updateMany({
      where: { id, userId: user.id },
      data: { completed },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to toggle todo:", error);
  }
}

export async function deleteTodo(id: string) {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    await db.todo.deleteMany({
      where: { id, userId: user.id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete todo:", error);
  }
}

export async function reorderTodos(ids: string[]) {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    // Run all updates in a database transaction for performance and atomicity
    await db.$transaction(
      ids.map((id, index) =>
        db.todo.updateMany({
          where: { id, userId: user.id },
          data: { order: index },
        })
      )
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to reorder todos:", error);
  }
}
