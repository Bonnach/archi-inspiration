import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = params

    // Supprimer la photo (soft delete en mettant active à false)
    const photo = await prisma.inspirationPhoto.update({
      where: { id: photoId },
      data: { active: false }
    })

    return NextResponse.json({
      message: 'Photo supprimée avec succès',
      photo
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = params
    const { title, description, tags, roomTypeId, active } = await request.json()

    const photo = await prisma.inspirationPhoto.update({
      where: { id: photoId },
      data: {
        title,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        roomTypeId: roomTypeId || null,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json({
      message: 'Photo modifiée avec succès',
      photo
    })

  } catch (error) {
    console.error('Erreur lors de la modification de la photo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}