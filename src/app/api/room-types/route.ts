import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const roomTypes = await prisma.roomType.findMany({
      where: { 
        architectId,
        active: true 
      },
      orderBy: { displayOrder: 'asc' },
      include: {
        questions: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: {
            inspirationPhotos: {
              where: { active: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ roomTypes })

  } catch (error) {
    console.error('Erreur lors de la récupération des types de pièces:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, architectId, displayOrder } = await request.json()

    if (!name || !architectId) {
      return NextResponse.json(
        { error: 'Le nom et l\'ID architecte sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier si le type de pièce existe déjà pour cet architecte
    const existing = await prisma.roomType.findFirst({
      where: { 
        name: name.trim(),
        architectId,
        active: true
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce type de pièce existe déjà pour cet architecte' },
        { status: 409 }
      )
    }

    const roomType = await prisma.roomType.create({
      data: {
        name: name.trim(),
        architectId,
        displayOrder: displayOrder || 0,
        active: true
      },
      include: {
        questions: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: 'Type de pièce créé avec succès',
      roomType
    })

  } catch (error) {
    console.error('Erreur lors de la création du type de pièce:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
