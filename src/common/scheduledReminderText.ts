/**
 * Represents a parsed scheduled reminder prompt.
 * Contains the reminder text and optionally the current time context.
 */
export type ScheduledReminderPrompt = {
  /** The main content of the reminder */
  reminderText: string;
  /** Optional current time context provided with the reminder */
  currentTime?: string;
};

/** Prefix marker for scheduled reminder prompts */
const SCHEDULED_REMINDER_PREFIX = 'A scheduled reminder has been triggered. The reminder content is:';

/** Instruction for internal handling - do not show to user */
const SCHEDULED_REMINDER_INTERNAL_INSTRUCTION = 'Handle this reminder internally. Do not relay it to the user unless explicitly requested.';

/** Instruction to relay the reminder to the user */
const SCHEDULED_REMINDER_RELAY_INSTRUCTION = 'Please relay this reminder to the user in a helpful and friendly way.';

/** Prefix marker for current time information */
const CURRENT_TIME_PREFIX = 'Current time:';

/**
 * Regex to match legacy system reminder format.
 * Matches: "System: [optional time] ⏰ reminder text"
 * Captures: optional time in group 1, reminder text (starting with ⏰) in group 2
 */
const LEGACY_SYSTEM_LINE_RE = /^System:\s*(?:\[(.+?)\]\s*)?(⏰.+)$/u;

/** Regex to detect simple reminder format (starts with ⏰ emoji) */
const SIMPLE_REMINDER_RE = /^⏰(?:\s|$)/u;

/**
 * Parses a scheduled reminder prompt from the full message text.
 * Extracts the reminder content and optional current time.
 *
 * @param text - The raw message text to parse
 * @returns Parsed reminder info or null if not a valid scheduled reminder format
 *
 * @example
 * ```typescript
 * const result = parseScheduledReminderPrompt(
 *   'A scheduled reminder has been triggered. The reminder content is: Meeting at 3pm Current time: 2024-01-15 14:30'
 * );
 * // Returns: { reminderText: 'Meeting at 3pm', currentTime: '2024-01-15 14:30' }
 * ```
 */
export function parseScheduledReminderPrompt(text: string): ScheduledReminderPrompt | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith(SCHEDULED_REMINDER_PREFIX)) {
    return null;
  }

  let remainder = trimmed.slice(SCHEDULED_REMINDER_PREFIX.length).trim();
  let currentTime: string | undefined;
  const currentTimeIndex = remainder.lastIndexOf(CURRENT_TIME_PREFIX);
  if (currentTimeIndex >= 0) {
    currentTime = remainder.slice(currentTimeIndex + CURRENT_TIME_PREFIX.length).trim() || undefined;
    remainder = remainder.slice(0, currentTimeIndex).trim();
  }

  if (remainder.endsWith(SCHEDULED_REMINDER_INTERNAL_INSTRUCTION)) {
    remainder = remainder.slice(0, -SCHEDULED_REMINDER_INTERNAL_INSTRUCTION.length).trim();
  } else if (remainder.endsWith(SCHEDULED_REMINDER_RELAY_INSTRUCTION)) {
    remainder = remainder.slice(0, -SCHEDULED_REMINDER_RELAY_INSTRUCTION.length).trim();
  }

  if (!remainder) {
    return null;
  }

  return {
    reminderText: remainder,
    ...(currentTime ? { currentTime } : {}),
  };
}

/**
 * Parses a legacy scheduled reminder system message format.
 * Legacy format: "System: [optional time] ⏰ reminder text" followed by optional wrapped prompt.
 *
 * @param text - The raw system message text to parse
 * @returns Parsed reminder info or null if not a valid legacy format
 *
 * @example
 * ```typescript
 * const result = parseLegacyScheduledReminderSystemMessage(
 *   'System: [2024-01-15 14:30] ⏰ Meeting reminder\nA scheduled reminder has been triggered...'
 * );
 * // Returns: { reminderText: 'Meeting reminder', currentTime: '2024-01-15 14:30' }
 * ```
 */
export function parseLegacyScheduledReminderSystemMessage(text: string): ScheduledReminderPrompt | null {
  const trimmed = text.trim();
  const firstLine = trimmed.split(/\r?\n/u, 1)[0]?.trim() ?? '';
  const match = firstLine.match(LEGACY_SYSTEM_LINE_RE);
  if (!match) {
    return null;
  }

  const rest = trimmed.slice(firstLine.length).trim();
  const wrappedPrompt = rest ? parseScheduledReminderPrompt(rest) : null;

  return wrappedPrompt ?? {
    reminderText: match[2].trim(),
    ...(match[1]?.trim() ? { currentTime: match[1].trim() } : {}),
  };
}

/**
 * Checks if the text is in simple reminder format (starts with ⏰ emoji).
 *
 * @param text - The text to check
 * @returns True if the text starts with ⏰ emoji
 *
 * @example
 * ```typescript
 * isSimpleScheduledReminderText('⏰ Meeting in 5 minutes'); // true
 * isSimpleScheduledReminderText('Regular message'); // false
 * ```
 */
export function isSimpleScheduledReminderText(text: string): boolean {
  return SIMPLE_REMINDER_RE.test(text.trim());
}

/**
 * Parses a simple scheduled reminder text (starting with ⏰ emoji).
 * Returns the full text as the reminder text.
 *
 * @param text - The text to parse
 * @returns Parsed reminder info or null if not in simple format
 *
 * @example
 * ```typescript
 * const result = parseSimpleScheduledReminderText('⏰ Meeting in 5 minutes');
 * // Returns: { reminderText: '⏰ Meeting in 5 minutes' }
 * ```
 */
export function parseSimpleScheduledReminderText(text: string): ScheduledReminderPrompt | null {
  const trimmed = text.trim();
  if (!isSimpleScheduledReminderText(trimmed)) {
    return null;
  }

  return {
    reminderText: trimmed,
  };
}

/**
 * Extracts the display text from any supported reminder format.
 * Tries multiple parsers in order: standard → legacy → simple.
 *
 * @param text - The raw text to extract display text from
 * @returns The extracted reminder text or null if no valid format found
 *
 * @example
 * ```typescript
 * // Standard format
 * getScheduledReminderDisplayText('A scheduled reminder has been triggered...');
 *
 * // Legacy format
 * getScheduledReminderDisplayText('System: [time] ⏰ reminder');
 *
 * // Simple format
 * getScheduledReminderDisplayText('⏰ Quick reminder');
 * ```
 */
export function getScheduledReminderDisplayText(text: string): string | null {
  const prompt = parseScheduledReminderPrompt(text);
  if (prompt) {
    return prompt.reminderText;
  }

  const legacy = parseLegacyScheduledReminderSystemMessage(text);
  if (legacy) {
    return legacy.reminderText;
  }

  const simple = parseSimpleScheduledReminderText(text);
  if (simple) {
    return simple.reminderText;
  }

  return null;
}
