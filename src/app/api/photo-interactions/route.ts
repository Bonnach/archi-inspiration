import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, photoId, action, annotationsJson } = await request.json()

    // Vérifier que la session existe
    const session = await prisma.clientSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Créer ou mettre à jour l'interaction
    const interaction = await prisma.photoInteraction.upsert({
      where: {
        sessionId_photoId: {
          sessionId,
          photoId
        }
      },
      update: {
        action,
        annotationsJson
      },
      create: {
        sessionId,
        photoId,
        action,
        annotationsJson
      }
    })

    return NextResponse.json({
      message: 'Interaction sauvegardée',
      interaction
    })

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'interaction:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID session requis' },
        { status: 400 }
      )
    }

    const interactions = await prisma.photoInteraction.findMany({
      where: { sessionId },
      include: {
        photo: {
          select: {
            id: true,
            imageUrl: true,
            title: true,
            description: true,
            tags: true
          }
        }
      }
    })

    return NextResponse.json({ interactions })

  } catch (error) {
    console.error('Erreur lors de la récupération des interactions:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}