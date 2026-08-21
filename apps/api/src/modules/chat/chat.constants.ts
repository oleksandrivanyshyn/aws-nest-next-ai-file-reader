export const TOP_K = 5;

export const MIN_RELEVANCE_SCORE = 0.3;

export const MAX_QUESTION_LENGTH = 1000;

export const CHAT_SYSTEM_PROMPT_WITH_CONTEXT =
  'You are a helpful assistant answering questions about a user document. ' +
  'Answer the question using only the provided document excerpts. ' +
  'If the answer cannot be found in the excerpts, state clearly that the document does not contain that information. ' +
  'Do not invent or extrapolate beyond what is directly supported by the excerpts.';

export const CHAT_SYSTEM_PROMPT_NO_CONTEXT =
  'You are a helpful assistant answering questions about a user document. ' +
  'No matching or relevant excerpts were found in the uploaded document for this question. ' +
  'Politely inform the user that the information could not be found in their document.';
