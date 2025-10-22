import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, answerValue } = await request.json()

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

    // Créer ou mettre à jour la réponse
    const answer = await prisma.clientAnswer.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId
        }
      },
      update: {
        answerValue
      },
      create: {
        sessionId,
        questionId,
        answerValue
      }
    })

    return NextResponse.json({
      message: 'Réponse sauvegardée',
      answer
    })

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la réponse:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}