import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Marquer toutes les sessions "in_progress" qui ont des réponses comme "completed"
    const result = await prisma.clientSession.updateMany({
      where: {
        status: 'in_progress',
        clientAnswers: {
          some: {} // Au moins une réponse
        }
      },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `${result.count} sessions mises à jour`,
      count: result.count
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}