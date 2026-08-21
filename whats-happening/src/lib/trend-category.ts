import { isAiSignal, sanitizeExcerpt } from "./trend-content";
type ClassifiableSignal = { title?: unknown; excerpt?: unknown };

const sportsDomainPatterns = [
  /\b(?:sports?|athlet(?:e|es|ic|ics)|football|soccer|basketball|baseball|tennis|cricket|rugby|hockey|golf|olympics?|paralympics?|motorsports?|formula\s*(?:one|1)|f1|cycling|swimming|esports?)\b/i,
  /\b(?:player|athlete)\s+(?:performance|analysis|analytics|tracking|scouting|injury|recovery)\b/i,
  /\b(?:referee|officiating|video assistant referee|goal-line technology|sports science|sports medicine)\b/i,
];

export function isAiSportsSignal(signal: ClassifiableSignal) {
  if (!isAiSignal(signal)) return false;
  const text = [sanitizeExcerpt(signal.title), sanitizeExcerpt(signal.excerpt)].filter(Boolean).join(" ");
  return sportsDomainPatterns.some((pattern) => pattern.test(text));
}

export function categoryForSignals(signals: ClassifiableSignal[]) {
  if (signals.some(isAiSportsSignal)) return "Sports";

  const value = signals
    .flatMap((signal) => [sanitizeExcerpt(signal.title), sanitizeExcerpt(signal.excerpt)])
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  if (/\b(ai|llm|model|agent|machine learning)\b/.test(value)) return "Artificial Intelligence";
  if (/\b(climate|energy|battery|carbon)\b/.test(value)) return "Climate & Energy";
  if (/\b(github|api|framework|library|developer)\b/.test(value)) return "Developer Tools";
  if (/\b(space|nasa|rocket|orbit)\b/.test(value)) return "Space";
  if (/\b(health|medicine|clinical|drug)\b/.test(value)) return "Health";
  return "World";
}
