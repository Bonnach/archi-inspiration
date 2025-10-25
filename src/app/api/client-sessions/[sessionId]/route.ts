import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Supprimer la session et toutes ses données liées (cascade)
    const session = await prisma.clientSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({
      message: 'Session supprimée avec succès',
      session
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const session = await prisma.clientSession.findUnique({
      where: { id: sessionId },
      include: {
        architect: {
          select: {
            name: true,
            company: true
          }
        },
        clientAnswers: {
          include: {
            question: {
              include: {
                roomType: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        photoInteractions: {
          include: {
            photo: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ session })

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}