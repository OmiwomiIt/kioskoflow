import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const categorias = await prisma.categoria.findMany({
    where: { usuarioId: user.id },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await request.json();
  const categoria = await prisma.categoria.create({
    data: {
      nombre: data.nombre,
      activo: true,
      usuarioId: user.id,
    },
  });
  return NextResponse.json(categoria, { status: 201 });
}