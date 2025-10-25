import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { selectedRoomTypes } = body

    if (!Array.isArray(selectedRoomTypes)) {
      return NextResponse.json(
        { error: 'selectedRoomTypes doit être un tableau' },
        { status: 400 }
      )
    }

    // Mettre à jour la session avec les pièces sélectionnées
    const session = await prisma.clientSession.update({
      where: { id: sessionId },
      data: {
        selectedRoomTypes: JSON.stringify(selectedRoomTypes)
      }
    })

    return NextResponse.json({ 
      success: true,
      session 
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
