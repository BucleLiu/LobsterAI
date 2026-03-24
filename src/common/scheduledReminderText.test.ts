/**
 * Unit tests for scheduledReminderText.ts
 * Tests parsing of scheduled reminder prompts in various formats
 */
import { test, expect } from 'vitest';
import {
  parseScheduledReminderPrompt,
  parseLegacyScheduledReminderSystemMessage,
  isSimpleScheduledReminderText,
  parseSimpleScheduledReminderText,
  getScheduledReminderDisplayText,
} from './scheduledReminderText';

// ==================== parseScheduledReminderPrompt ====================

test('parseScheduledReminderPrompt: standard format with reminder text only', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is: Meeting at 3pm';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toEqual({ reminderText: 'Meeting at 3pm' });
});

test('parseScheduledReminderPrompt: with current time', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is: Meeting at 3pm Current time: 2024-01-15 14:30';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toEqual({
    reminderText: 'Meeting at 3pm',
    currentTime: '2024-01-15 14:30',
  });
});

test('parseScheduledReminderPrompt: with internal instruction', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is: Check email Handle this reminder internally. Do not relay it to the user unless explicitly requested.';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toEqual({ reminderText: 'Check email' });
});

test('parseScheduledReminderPrompt: with relay instruction', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is: Team standup Please relay this reminder to the user in a helpful and friendly way.';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toEqual({ reminderText: 'Team standup' });
});

test('parseScheduledReminderPrompt: with time and instruction', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is: Daily report Current time: 2024-01-15 09:00 Handle this reminder internally. Do not relay it to the user unless explicitly requested.';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toEqual({
    reminderText: 'Daily report',
    currentTime: '2024-01-15 09:00 Handle this reminder internally. Do not relay it to the user unless explicitly requested.',
  });
});

test('parseScheduledReminderPrompt: empty content returns null', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is:';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toBeNull();
});

test('parseScheduledReminderPrompt: whitespace only content returns null', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is:   ';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toBeNull();
});

test('parseScheduledReminderPrompt: non-matching text returns null', () => {
  const text = 'This is just a regular message';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toBeNull();
});

test('parseScheduledReminderPrompt: trims whitespace', () => {
  const text = '  A scheduled reminder has been triggered. The reminder content is: Reminder text  ';
  const result = parseScheduledReminderPrompt(text);
  expect(result).toEqual({ reminderText: 'Reminder text' });
});

// ==================== parseLegacyScheduledReminderSystemMessage ====================

test('parseLegacyScheduledReminderSystemMessage: simple legacy format', () => {
  const text = 'System: ⏰ Meeting reminder';
  const result = parseLegacyScheduledReminderSystemMessage(text);
  expect(result).toEqual({ reminderText: '⏰ Meeting reminder' });
});

test('parseLegacyScheduledReminderSystemMessage: with time', () => {
  const text = 'System: [2024-01-15 14:30] ⏰ Meeting reminder';
  const result = parseLegacyScheduledReminderSystemMessage(text);
  expect(result).toEqual({
    reminderText: '⏰ Meeting reminder',
    currentTime: '2024-01-15 14:30',
  });
});

test('parseLegacyScheduledReminderSystemMessage: with wrapped prompt', () => {
  const text = `System: ⏰ Meeting reminder
A scheduled reminder has been triggered. The reminder content is: Team meeting at 3pm`;
  const result = parseLegacyScheduledReminderSystemMessage(text);
  expect(result).toEqual({ reminderText: 'Team meeting at 3pm' });
});

test('parseLegacyScheduledReminderSystemMessage: wrapped prompt takes precedence', () => {
  const text = `System: [2024-01-15 10:00] ⏰ Old reminder text
A scheduled reminder has been triggered. The reminder content is: New reminder text Current time: 2024-01-15 14:30`;
  const result = parseLegacyScheduledReminderSystemMessage(text);
  expect(result).toEqual({
    reminderText: 'New reminder text',
    currentTime: '2024-01-15 14:30',
  });
});

test('parseLegacyScheduledReminderSystemMessage: non-matching text returns null', () => {
  const text = 'Regular system message';
  const result = parseLegacyScheduledReminderSystemMessage(text);
  expect(result).toBeNull();
});

test('parseLegacyScheduledReminderSystemMessage: empty reminder returns null', () => {
  const text = 'System: ';
  const result = parseLegacyScheduledReminderSystemMessage(text);
  expect(result).toBeNull();
});

// ==================== isSimpleScheduledReminderText ====================

test('isSimpleScheduledReminderText: starts with emoji', () => {
  expect(isSimpleScheduledReminderText('⏰ Meeting reminder')).toBe(true);
});

test('isSimpleScheduledReminderText: emoji followed by space', () => {
  expect(isSimpleScheduledReminderText('⏰ Meeting in 5 minutes')).toBe(true);
});

test('isSimpleScheduledReminderText: just emoji', () => {
  expect(isSimpleScheduledReminderText('⏰')).toBe(true);
});

test('isSimpleScheduledReminderText: no emoji', () => {
  expect(isSimpleScheduledReminderText('Meeting reminder')).toBe(false);
});

test('isSimpleScheduledReminderText: emoji in middle', () => {
  expect(isSimpleScheduledReminderText('Meeting ⏰ reminder')).toBe(false);
});

test('isSimpleScheduledReminderText: empty string', () => {
  expect(isSimpleScheduledReminderText('')).toBe(false);
});

test('isSimpleScheduledReminderText: whitespace before emoji', () => {
  expect(isSimpleScheduledReminderText('  ⏰ reminder')).toBe(true);
});

// ==================== parseSimpleScheduledReminderText ====================

test('parseSimpleScheduledReminderText: valid simple format', () => {
  const text = '⏰ Meeting in 5 minutes';
  const result = parseSimpleScheduledReminderText(text);
  expect(result).toEqual({ reminderText: '⏰ Meeting in 5 minutes' });
});

test('parseSimpleScheduledReminderText: returns full text', () => {
  const text = '⏰ Daily standup at 10am';
  const result = parseSimpleScheduledReminderText(text);
  expect(result).toEqual({ reminderText: '⏰ Daily standup at 10am' });
});

test('parseSimpleScheduledReminderText: non-matching returns null', () => {
  const text = 'Meeting reminder';
  const result = parseSimpleScheduledReminderText(text);
  expect(result).toBeNull();
});

test('parseSimpleScheduledReminderText: trims whitespace', () => {
  const text = '  ⏰ Reminder text  ';
  const result = parseSimpleScheduledReminderText(text);
  expect(result).toEqual({ reminderText: '⏰ Reminder text' });
});

// ==================== getScheduledReminderDisplayText ====================

test('getScheduledReminderDisplayText: standard format', () => {
  const text = 'A scheduled reminder has been triggered. The reminder content is: Meeting at 3pm';
  expect(getScheduledReminderDisplayText(text)).toBe('Meeting at 3pm');
});

test('getScheduledReminderDisplayText: legacy format', () => {
  const text = 'System: [2024-01-15 14:30] ⏰ Meeting reminder';
  expect(getScheduledReminderDisplayText(text)).toBe('⏰ Meeting reminder');
});

test('getScheduledReminderDisplayText: simple format', () => {
  const text = '⏰ Quick reminder';
  expect(getScheduledReminderDisplayText(text)).toBe('⏰ Quick reminder');
});

test('getScheduledReminderDisplayText: standard takes precedence over legacy', () => {
  const text = `System: ⏰ Legacy text
A scheduled reminder has been triggered. The reminder content is: Standard text`;
  expect(getScheduledReminderDisplayText(text)).toBe('Standard text');
});

test('getScheduledReminderDisplayText: no matching format returns null', () => {
  const text = 'Just a regular message';
  expect(getScheduledReminderDisplayText(text)).toBeNull();
});

test('getScheduledReminderDisplayText: empty string returns null', () => {
  expect(getScheduledReminderDisplayText('')).toBeNull();
});
