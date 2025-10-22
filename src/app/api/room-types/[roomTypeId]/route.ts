import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { roomTypeId: string } }
) {
  try {
    const { roomTypeId } = params
    const { name, displayOrder, active } = await request.json()

    const roomType = await prisma.roomType.update({
      where: { id: roomTypeId },
      data: {
        name,
        displayOrder: displayOrder || 0,
        active: active !== undefined ? active : true
      },
      include: {
        questions: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: 'Type de pièce modifié avec succès',
      roomType
    })

  } catch (error) {
    console.error('Erreur lors de la modification du type de pièce:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomTypeId: string } }
) {
  try {
    const { roomTypeId } = params

    // Soft delete - désactiver au lieu de supprimer
    const roomType = await prisma.roomType.update({
      where: { id: roomTypeId },
      data: { active: false }
    })

    return NextResponse.json({
      message: 'Type de pièce supprimé avec succès',
      roomType
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du type de pièce:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}