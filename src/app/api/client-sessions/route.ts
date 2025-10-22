import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, architectId } = await request.json()

    // Vérifier que l'architecte existe
    const architect = await prisma.architect.findUnique({
      where: { id: architectId }
    })

    if (!architect) {
      return NextResponse.json(
        { error: 'Architecte non trouvé' },
        { status: 404 }
      )
    }

    // Créer la session client
    const session = await prisma.clientSession.create({
      data: {
        firstName,
        lastName,
        email,
        architectId
      }
    })

    return NextResponse.json({
      message: 'Session créée avec succès',
      session
    })

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const architectId = searchParams.get('architectId')

    if (!architectId) {
      return NextResponse.json(
        { error: 'ID architecte requis' },
        { status: 400 }
      )
    }

    const sessions = await prisma.clientSession.findMany({
      where: { architectId },
      orderBy: { createdAt: 'desc' },
      include: {
        clientAnswers: {
          include: {
            question: {
              include: {
                roomType: true
              }
            }
          }
        },
        photoInteractions: {
          include: {
            photo: true
          }
        }
      }
    })

    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}