import cloudinary from '../../../components/lib/cloudinary';
import clientPromise from '../../../components/lib/mongodb';
import Image from '../../../components/models/Image';
import { getSession } from '../../../components/lib/session';
import { analyzeImageWithGemini, generateStudyNotes } from '../../../components/lib/gemini';
import { useMemo } from 'react';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // or '20mb', adjust as needed
    },
  },
};

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'POST') {
    const { imageBase64, makeNotesForStudy } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }
    try {
      // 1. Upload to Cloudinary (temporarily in 'uncategorized')
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: `snapeek/${session.email}/uncategorized`,
        resource_type: 'image',
      });

      // 2. AI analysis (Gemini) - returns { description, category }
      let description = 'No AI description available';
      let category = 'uncategorized';

      try {
        const aiResult = await analyzeImageWithGemini(uploadRes.secure_url);
        console.log('Gemini raw response:', aiResult.rawResponse);

        // Only use AI category if it exists and is not empty
        if (aiResult.category && typeof aiResult.category === 'string' && aiResult.category.trim() !== '') {
          // Sanitize category for Cloudinary folder
          category = aiResult.category.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          console.log('Sanitized category:', category);
        } else {
          category = 'uncategorized';
          console.log('AI did not return a valid category, using uncategorized');
        }

        description = aiResult.description || 'No AI description available';
      } catch (e) {
        console.error('Gemini AI error:', e);
        // category remains 'uncategorized'
        description = 'No AI description available';
      }

      // 3. Move image to correct folder in Cloudinary if needed
      let finalPublicId = uploadRes.public_id;
      let finalUrl = uploadRes.secure_url;

      // Sanitize email and category for folder names
      const safeEmail = session.email.replace(/[@.]/g, '_');
      const safeCategory = category.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const fileName = uploadRes.public_id.split('/').pop();
      const newPublicId = `snapeek/${safeEmail}/${safeCategory}/${fileName}`;

      if (safeCategory !== 'uncategorized') {
        console.log('Attempting to move image:', uploadRes.public_id, 'to', newPublicId);
        try {
          const moveRes = await cloudinary.uploader.rename(
            uploadRes.public_id,
            newPublicId
          );
          console.log('Cloudinary move result:', moveRes);
          finalPublicId = moveRes.public_id;
          finalUrl = moveRes.secure_url;
        } catch (e) {
          console.error('Cloudinary move error:', e);
          // If move fails, keep the original
        }
      }

      // 4. Generate study notes if requested
      let studyNotes = null;
      if (makeNotesForStudy) {
        try {
          const notesResult = await generateStudyNotes(finalUrl, description);
          studyNotes = notesResult;
        } catch (e) {
          console.error('Notes generation error:', e);
          // Continue without notes if generation fails
        }
      }

      // 5. Save metadata to MongoDB
      const db = (await clientPromise).db();
      const imageDoc = new Image({
        url: finalUrl,
        public_id: finalPublicId,
        userId: session.email,
        folder: category,
        description,
        createdAt: new Date(),
      });
      await db.collection('images').insertOne(imageDoc);

      // 6. Save study notes if generated
      if (Array.isArray(studyNotes) && studyNotes.length > 0 && makeNotesForStudy) {
        const notesToInsert = studyNotes.map(note => ({
          userId: session.email,
          imageId: imageDoc._id,
          imageUrl: finalUrl,
          noteContent: note.noteContent,
          noteType: 'study_summary',
          subject: note.subject || category, // Use subject from note, fallback to image category
          createdAt: new Date(),
          lastModified: new Date()
        }));
        await db.collection('notes').insertMany(notesToInsert);
      }

      return res.status(201).json({ image: imageDoc, studyNotes });
    } catch (err) {
      return res.status(500).json({ error: 'Cloudinary upload failed', details: err.message });
    }
  }

  if (req.method === 'GET') {
    const db = (await clientPromise).db();
    const images = await db
      .collection('images')
      .find({ userId: session.email })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json({ images });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
