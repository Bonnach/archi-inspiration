import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Trouver l'architecte
    const architect = await prisma.architect.findUnique({
      where: { email }
    })

    if (!architect) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, architect.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Retourner les informations de l'architecte (sans le mot de passe)
    const { password: _, ...architectData } = architect

    return NextResponse.json({
      message: 'Connexion réussie',
      architect: architectData
    })

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}