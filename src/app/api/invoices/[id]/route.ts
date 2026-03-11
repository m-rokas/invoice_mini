import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { clientId, invoiceNum, dueDate, status, notes, items } = await req.json();

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );

    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: params.id,
      },
    });

    const invoice = await prisma.invoice.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        clientId,
        invoiceNum,
        dueDate: new Date(dueDate),
        status,
        totalAmount,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.invoice.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Invoice deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
