import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface DocumentStructure {
  title: string;
  introduction: string;
  mainConcepts: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  conclusion: string;
}

export async function generateStructuredDocument(
  text: string,
  images: string[]
): Promise<DocumentStructure> {
  try {
    if (!text) {
      throw new Error('Le texte à analyser est vide');
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('La clé API OpenAI n\'est pas configurée');
    }

    const maxLength = 4000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "\n[Texte tronqué pour respecter les limites...]"
      : text;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un professeur expert chargé de transformer ce contenu en une leçon structurée et détaillée.

DIRECTIVES IMPORTANTES:
1. DÉVELOPPEMENT APPROFONDI :
   - Chaque section doit faire entre 5 et 10 lignes minimum
   - Expliquer chaque concept en détail avec des exemples
   - Développer les idées de manière approfondie
   - Éviter les résumés trop concis

2. STRUCTURE PÉDAGOGIQUE :
   - Introduction : Présenter le contexte et les objectifs (8-10 lignes)
   - Corps de la leçon : Développer chaque concept en profondeur
   - Conclusion : Synthétiser les points clés (5-7 lignes)

3. CONTENU DÉTAILLÉ :
   - Expliquer le "pourquoi" et le "comment" de chaque concept
   - Inclure des explications détaillées
   - Ajouter des exemples concrets quand c'est pertinent
   - Établir des liens entre les différentes parties

4. STYLE D'ÉCRITURE :
   - Utiliser un style pédagogique et engageant
   - Maintenir un niveau de détail constant
   - Éviter les simplifications excessives
   - Garder le vocabulaire technique approprié

FORMAT DE RÉPONSE (JSON uniquement):
{
  "title": "Titre de la leçon",
  "introduction": "Introduction détaillée qui pose le contexte, les objectifs et l'importance du sujet (8-10 lignes)",
  "mainConcepts": [
    {
      "title": "Titre de la partie",
      "content": "Explication détaillée et approfondie du concept (minimum 5-10 lignes)",
      "keyPoints": ["Points essentiels à retenir de cette partie"]
    }
  ],
  "conclusion": "Synthèse approfondie des apprentissages (5-7 lignes)"
}`
        },
        {
          role: "user",
          content: truncatedText
        }
      ],
      temperature: 0.4,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('La réponse de l\'API est vide');
    }

    try {
      const parsedContent = JSON.parse(content) as DocumentStructure;
      
      // Validation de la structure
      if (!parsedContent.title || typeof parsedContent.title !== 'string') {
        throw new Error('Le titre est manquant ou invalide');
      }
      if (!parsedContent.introduction || typeof parsedContent.introduction !== 'string') {
        throw new Error('L\'introduction est manquante ou invalide');
      }
      if (!Array.isArray(parsedContent.mainConcepts)) {
        throw new Error('Les concepts principaux sont manquants ou invalides');
      }
      if (!parsedContent.conclusion || typeof parsedContent.conclusion !== 'string') {
        throw new Error('La conclusion est manquante ou invalide');
      }

      return parsedContent;
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      throw new Error('Le format de la réponse est invalide. Veuillez réessayer.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Erreur d\'authentification avec l\'API OpenAI. Veuillez vérifier votre clé API.');
    } else if (error.response?.status === 429) {
      throw new Error('Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.');
    } else if (error.response?.status === 500) {
      throw new Error('Erreur serveur OpenAI. Veuillez réessayer ultérieurement.');
    }

    throw new Error(error.message || 'Une erreur est survenue lors de la génération de la leçon');
  }
}

interface VideoSummary {
  title: string;
  content: string;
  keyPoints: string[];
}

export async function generateVideoSummary(script: string): Promise<VideoSummary> {
  try {
    if (!script.trim()) {
      throw new Error('Le script est vide');
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('La clé API OpenAI n\'est pas configurée');
    }

    const maxLength = 4000;
    const truncatedScript = script.length > maxLength 
      ? script.substring(0, maxLength) + "\n[Script tronqué pour respecter les limites...]"
      : script;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un professeur expert chargé de transformer ce contenu vidéo en une partie de leçon détaillée.

DIRECTIVES IMPORTANTES:
1. DÉVELOPPEMENT APPROFONDI :
   - Le contenu doit faire entre 5 et 10 lignes minimum
   - Expliquer chaque concept en détail
   - Développer les idées de manière approfondie
   - Éviter les résumés trop concis

2. STRUCTURE PÉDAGOGIQUE :
   - Commencer par une mise en contexte
   - Développer les concepts principaux
   - Conclure avec une synthèse

3. CONTENU DÉTAILLÉ :
   - Expliquer le "pourquoi" et le "comment"
   - Inclure des explications détaillées
   - Ajouter des exemples concrets
   - Établir des liens logiques

4. STYLE D'ÉCRITURE :
   - Utiliser un style pédagogique et engageant
   - Maintenir un niveau de détail constant
   - Éviter les simplifications excessives
   - Garder le vocabulaire technique approprié

FORMAT DE RÉPONSE (JSON uniquement):
{
  "title": "Titre de cette partie de la leçon",
  "content": "Explication détaillée et approfondie des concepts (minimum 5-10 lignes)",
  "keyPoints": ["Points essentiels à retenir de cette partie"]
}`
        },
        {
          role: "user",
          content: truncatedScript
        }
      ],
      temperature: 0.4,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('La réponse de l\'API est vide');
    }

    try {
      const parsedContent = JSON.parse(content) as VideoSummary;
      
      // Validation de la structure
      if (!parsedContent.title || typeof parsedContent.title !== 'string') {
        throw new Error('Le titre est manquant ou invalide');
      }
      if (!parsedContent.content || typeof parsedContent.content !== 'string') {
        throw new Error('Le contenu est manquant ou invalide');
      }
      if (!Array.isArray(parsedContent.keyPoints)) {
        throw new Error('Les points clés sont manquants ou invalides');
      }

      return parsedContent;
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      throw new Error('Le format de la réponse est invalide. Veuillez réessayer.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Erreur d\'authentification avec l\'API OpenAI. Veuillez vérifier votre clé API.');
    } else if (error.response?.status === 429) {
      throw new Error('Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.');
    } else if (error.response?.status === 500) {
      throw new Error('Erreur serveur OpenAI. Veuillez réessayer ultérieurement.');
    }

    throw new Error(error.message || 'Une erreur est survenue lors de la création du contenu vidéo');
  }
}