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

    const photos = await prisma.inspirationPhoto.findMany({
      where: {
        architectId,
        active: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ photos })

  } catch (error) {
    console.error('Erreur lors de la récupération des photos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { architectId, roomTypeId, imageUrl, title, description, tags } = await request.json()

    const photo = await prisma.inspirationPhoto.create({
      data: {
        architectId,
        roomTypeId,
        imageUrl,
        title,
        description,
        tags: tags ? JSON.stringify(tags) : null
      }
    })

    return NextResponse.json({
      message: 'Photo d\'inspiration créée avec succès',
      photo
    })

  } catch (error) {
    console.error('Erreur lors de la création de la photo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}