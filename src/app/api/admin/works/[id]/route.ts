import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { works } from "@/lib/schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL || "postgresql://stonerose_user:SimplePass123@localhost:5432/stonerose_db";
const client = postgres(connectionString);
const db = drizzle(client);

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Неверный ID работы" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, image, productId, productType, category } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (productId !== undefined) updateData.productId = productId;
    if (productType !== undefined) updateData.productType = productType;
    if (category !== undefined) updateData.category = category;

    const updatedWork = await db
      .update(works)
      .set(updateData)
      .where(eq(works.id, id))
      .returning();

    if (updatedWork.length === 0) {
      return NextResponse.json({ success: false, error: "Работа не найдена" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Работа успешно обновлена",
      data: updatedWork[0] 
    });
  } catch (error) {
    console.error("Ошибка при обновлении работы:", error);
    return NextResponse.json({ success: false, error: "Ошибка при обновлении работы" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Неверный ID работы" }, { status: 400 });
    }

    const deletedWork = await db
      .delete(works)
      .where(eq(works.id, id))
      .returning();

    if (deletedWork.length === 0) {
      return NextResponse.json({ success: false, error: "Работа не найдена" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Работа успешно удалена" 
    });
  } catch (error) {
    console.error("Ошибка при удалении работы:", error);
    return NextResponse.json({ success: false, error: "Ошибка при удалении работы" }, { status: 500 });
  }
}