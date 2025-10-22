import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, company } = await request.json()

    // Vérifier si l'architecte existe déjà
    const existingArchitect = await prisma.architect.findUnique({
      where: { email }
    })

    if (existingArchitect) {
      return NextResponse.json(
        { error: 'Un architecte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Créer l'architecte
    const architect = await prisma.architect.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Architecte créé avec succès',
      architect
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'architecte:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}