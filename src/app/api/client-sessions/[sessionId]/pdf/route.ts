import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const session = await prisma.clientSession.findUnique({
      where: { id: sessionId },
      include: {
        architect: {
          select: {
            name: true,
            company: true,
            email: true
          }
        },
        clientAnswers: {
          include: {
            question: {
              include: {
                roomType: true
              }
            }
          },
          orderBy: [
            { question: { roomType: { displayOrder: 'asc' } } },
            { question: { displayOrder: 'asc' } }
          ]
        },
        photoInteractions: {
          where: {
            action: 'like'
          },
          include: {
            photo: {
              include: {
                roomType: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Générer le contenu HTML du PDF
    const htmlContent = generateSessionHTML(session)

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="session-${session.firstName}-${session.lastName}.html"`
      }
    })

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

function generateSessionHTML(session: any): string {
  const likedPhotos = session.photoInteractions
  const groupedAnswers = session.clientAnswers.reduce((acc: any, answer: any) => {
    const roomTypeName = answer.question.roomType.name
    if (!acc[roomTypeName]) acc[roomTypeName] = []
    acc[roomTypeName].push(answer)
    return acc
  }, {})

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de session - ${session.firstName} ${session.lastName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #1E40AF;
            margin: 0;
            font-size: 2.5em;
        }
        .header .subtitle {
            color: #6B7280;
            font-size: 1.2em;
            margin-top: 10px;
        }
        .client-info {
            background-color: #F8FAFC;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #3B82F6;
        }
        .client-info h2 {
            margin-top: 0;
            color: #1E40AF;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6B7280;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #1E40AF;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .room-section {
            margin-bottom: 30px;
            background-color: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10B981;
        }
        .room-section h3 {
            color: #047857;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .answer {
            margin-bottom: 15px;
            padding: 12px;
            background-color: white;
            border-radius: 6px;
            border-left: 3px solid #D1D5DB;
        }
        .question {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
        }
        .response {
            color: #6B7280;
            font-style: italic;
        }
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 20px;
        }
        .photo-item {
            text-align: center;
            page-break-inside: avoid;
        }
        .photo-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .photo-caption {
            margin-top: 8px;
            font-size: 0.9em;
            color: #6B7280;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background-color: #F0F9FF;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #E0E7FF;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #1E40AF;
        }
        .stat-label {
            color: #6B7280;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #9CA3AF;
            font-size: 0.9em;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; padding: 15px; font-size: 12px; }
            .photos-grid { grid-template-columns: repeat(2, 1fr); }
            .photo-item img { height: 150px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport de Session Client</h1>
        <div class="subtitle">Analyse des préférences et inspirations</div>
    </div>

    <div class="client-info">
        <h2>Informations Client</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nom :</span>
                <span class="info-value">${session.firstName} ${session.lastName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email :</span>
                <span class="info-value">${session.email}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Architecte :</span>
                <span class="info-value">${session.architect.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Société :</span>
                <span class="info-value">${session.architect.company || 'Non spécifié'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Session créée :</span>
                <span class="info-value">${new Date(session.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Statut :</span>
                <span class="info-value">${session.status === 'completed' ? 'Terminée' : session.status === 'in_progress' ? 'En cours' : 'Abandonnée'}</span>
            </div>
        </div>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${session.clientAnswers.length}</div>
            <div class="stat-label">Réponses au questionnaire</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${likedPhotos.length}</div>
            <div class="stat-label">Images appréciées</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Object.keys(groupedAnswers).length}</div>
            <div class="stat-label">Types de pièces</div>
        </div>
    </div>

    ${Object.keys(groupedAnswers).length > 0 ? `
    <div class="section">
        <h2>Réponses au Questionnaire</h2>
        ${Object.entries(groupedAnswers).map(([roomType, answers]: [string, any]) => `
            <div class="room-section">
                <h3>${roomType}</h3>
                ${(answers as any[]).map(answer => `
                    <div class="answer">
                        <div class="question">${answer.question.questionText}</div>
                        <div class="response">${answer.answerValue}</div>
                    </div>
                `).join('')}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${likedPhotos.length > 0 ? `
    <div class="section">
        <h2>Images Appréciées (${likedPhotos.length})</h2>
        <div class="photos-grid">
            ${likedPhotos.map((interaction: any) => `
                <div class="photo-item">
                    <img src="${interaction.photo.imageUrl}" alt="${interaction.photo.title || 'Image d\'inspiration'}" />
                    <div class="photo-caption">
                        ${interaction.photo.title || 'Sans titre'}
                        ${interaction.photo.roomType ? ` • ${interaction.photo.roomType.name}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>Session ID: ${session.id}</p>
    </div>
</body>
</html>
  `
}