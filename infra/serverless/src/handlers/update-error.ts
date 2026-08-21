import { updateStatus } from '../clients/dynamodb';
import { parseUploadKey } from '../clients/s3';
import type { ErrorInput } from '../types/state';

export async function handler(input: ErrorInput): Promise<void> {
  const { key, error } = input;

  console.error(`ingestion failed for ${key}`, JSON.stringify(error));

  let { userEmail } = input;

  if (!userEmail) {
    try {
      ({ userEmail } = parseUploadKey(key));
    } catch (lookupError) {
      console.error('could not resolve the owner, leaving the record untouched', lookupError);
      return;
    }
  }

  const message = error?.Error
    ? `Processing failed at ${error.Error}`
    : 'Processing failed. Please try uploading the document again.';

  try {
    await updateStatus({ userEmail, status: 'ERROR', errorMessage: message });
  } catch (updateFailure) {
    console.error('could not record the error status', updateFailure);
  }
}
