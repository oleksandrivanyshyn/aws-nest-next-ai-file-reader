export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPE = 'application/pdf';

export function validateFile(file: File): string | null {
  if (file.type !== ALLOWED_MIME_TYPE) {
    return 'Only .pdf files are supported.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB.`;
  }
  if (file.size === 0) {
    return 'File is empty.';
  }
  return null;
}
