import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { questionId } = params
    const { text, type, options, required, displayOrder, active } = await request.json()

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: text?.trim(),
        type,
        options: options || [],
        required: required !== undefined ? required : true,
        displayOrder: displayOrder || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json({
      message: 'Question modifiée avec succès',
      question
    })

  } catch (error) {
    console.error('Erreur lors de la modification de la question:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { questionId } = params

    // Soft delete - désactiver au lieu de supprimer
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { active: false }
    })

    return NextResponse.json({
      message: 'Question supprimée avec succès',
      question
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}