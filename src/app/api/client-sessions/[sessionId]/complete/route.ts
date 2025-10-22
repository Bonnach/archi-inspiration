import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Marquer la session comme terminée
    const session = await prisma.clientSession.update({
      where: { id: sessionId },
      data: { 
        status: 'completed',
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Session marquée comme terminée',
      session
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}