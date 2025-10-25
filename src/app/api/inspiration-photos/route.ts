import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const architectId = searchParams.get('architectId')
    const sessionId = searchParams.get('sessionId')
    const selectedRoomIds = searchParams.get('selectedRoomIds') // JSON array string

    // Si sessionId est fourni, retourner toutes les photos de cette session (y compris uploads clients)
    if (sessionId) {
      const photos = await prisma.inspirationPhoto.findMany({
        where: {
          sessionId,
          active: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json({ photos })
    }

    // Sinon, comportement normal (photos de l'architecte)
    if (!architectId) {
      return NextResponse.json(
        { error: 'ID architecte ou sessionId requis' },
        { status: 400 }
      )
    }

    const photos = await prisma.inspirationPhoto.findMany({
      where: {
        architectId,
        active: true,
        isClientUpload: false // Ne retourner que les photos admin, pas les uploads clients
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filtrer par pièces sélectionnées si fourni
    let filteredPhotos = photos
    if (selectedRoomIds) {
      const roomIdsArray = JSON.parse(selectedRoomIds)
      filteredPhotos = photos.filter(photo => {
        if (!photo.roomTypeIds) return true // Photos sans pièce = affichées à tous
        const photoRoomIds = JSON.parse(photo.roomTypeIds)
        return photoRoomIds.some((roomId: string) => roomIdsArray.includes(roomId))
      })
    }

    return NextResponse.json({ photos: filteredPhotos })

  } catch (error) {
    console.error('Erreur lors de la récupération des photos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      architectId, 
      sessionId,
      roomTypeIds, 
      imageUrl, 
      title, 
      description, 
      tags,
      isClientUpload = false
    } = await request.json()

    const photo = await prisma.inspirationPhoto.create({
      data: {
        architectId,
        sessionId,
        roomTypeIds: roomTypeIds && roomTypeIds.length > 0 ? JSON.stringify(roomTypeIds) : null,
        imageUrl,
        title,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        isClientUpload
      }
    })

    return NextResponse.json({
      message: 'Photo d\'inspiration créée avec succès',
      photo
    })

  } catch (error) {
    console.error('Erreur lors de la création de la photo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}