import { extractText, getDocumentProxy } from 'unpdf';

import { updateStatus } from '../clients/dynamodb';
import { getBytes, parseUploadKey, putText } from '../clients/s3';
import type { ExtractTextResult, PipelineInput } from '../types/state';

export async function handler(input: PipelineInput): Promise<ExtractTextResult> {
  const { bucket, key } = input;

  const { documentId, userEmail } = parseUploadKey(key);

  await updateStatus({ userEmail, status: 'PROCESSING' });

  const pdf = await getDocumentProxy(await getBytes(bucket, key));
  const { text } = await extractText(pdf, { mergePages: true });

  const merged = Array.isArray(text) ? text.join('\n') : text;
  const normalised = merged.replace(/\s+/g, ' ').trim();

  if (!normalised) {
    throw new Error(
      'No text could be extracted. The PDF is most likely scanned images, ' +
        'which would need OCR rather than text extraction.',
    );
  }

  const textKey = `work/${documentId}/text.txt`;
  await putText(bucket, textKey, normalised);

  console.log(`extracted ${normalised.length} characters from ${key}`);

  return { bucket, key, documentId, userEmail, textKey, characters: normalised.length };
}
