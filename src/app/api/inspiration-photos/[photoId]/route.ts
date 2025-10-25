import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = await params

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
    const { photoId } = await params
    const { imageUrl, title, description, tags, roomTypeIds, active } = await request.json()

    const photo = await prisma.inspirationPhoto.update({
      where: { id: photoId },
      data: {
        imageUrl,
        title,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        roomTypeIds: roomTypeIds && roomTypeIds.length > 0 ? JSON.stringify(roomTypeIds) : null,
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