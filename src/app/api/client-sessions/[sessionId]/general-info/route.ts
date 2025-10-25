import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()

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

    // Mettre à jour les informations générales
    const updatedSession = await prisma.clientSession.update({
      where: { id: sessionId },
      data: {
        projectType: body.projectType,
        housingType: body.housingType,
        housingTypeOther: body.housingTypeOther,
        propertyUsage: body.propertyUsage,
        householdAdults: body.householdAdults,
        householdChildren: body.householdChildren,
        householdGrandchildren: body.householdGrandchildren,
        childrenAges: body.childrenAges,
        hasAnimals: body.hasAnimals,
        desiredOrganization: body.desiredOrganization,
        organizationComments: body.organizationComments
      }
    })

    return NextResponse.json({ 
      success: true,
      session: updatedSession
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
