import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { text, type, roomTypeId, options, required, displayOrder } = await request.json()

    if (!text || !type || !roomTypeId) {
      return NextResponse.json(
        { error: 'Le texte, le type et le type de pièce sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier que le type de pièce existe
    const roomType = await prisma.roomType.findFirst({
      where: { 
        id: roomTypeId,
        active: true 
      }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Type de pièce introuvable' },
        { status: 404 }
      )
    }

    // Créer la nouvelle question
    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        type,
        roomTypeId,
        options: options || [],
        required: required !== undefined ? required : true,
        displayOrder: displayOrder || 0,
        active: true
      }
    })

    return NextResponse.json({
      message: 'Question créée avec succès',
      question
    })

  } catch (error) {
    console.error('Erreur lors de la création de la question:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get('roomTypeId')

    let where = { active: true }
    if (roomTypeId) {
      where = { ...where, roomTypeId }
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        roomType: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json({ questions })

  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}