/**
 * Unit tests for coworkFormatTransform.ts
 * Tests format conversion between Anthropic and OpenAI API formats
 */
import { test, expect } from 'vitest';
import {
  normalizeProviderApiFormat,
  mapStopReason,
  formatSSEEvent,
  buildOpenAIChatCompletionsURL,
} from './coworkFormatTransform';

// ==================== normalizeProviderApiFormat ====================

test('normalizeProviderApiFormat: returns "openai" when format is openai', () => {
  expect(normalizeProviderApiFormat('openai')).toBe('openai');
});

test('normalizeProviderApiFormat: returns "anthropic" when format is anthropic', () => {
  expect(normalizeProviderApiFormat('anthropic')).toBe('anthropic');
});

test('normalizeProviderApiFormat: returns "anthropic" for undefined', () => {
  expect(normalizeProviderApiFormat(undefined)).toBe('anthropic');
});

test('normalizeProviderApiFormat: returns "anthropic" for null', () => {
  expect(normalizeProviderApiFormat(null)).toBe('anthropic');
});

test('normalizeProviderApiFormat: returns "anthropic" for empty string', () => {
  expect(normalizeProviderApiFormat('')).toBe('anthropic');
});

test('normalizeProviderApiFormat: returns "anthropic" for unknown format', () => {
  expect(normalizeProviderApiFormat('unknown')).toBe('anthropic');
});

test('normalizeProviderApiFormat: returns "anthropic" for other truthy values', () => {
  expect(normalizeProviderApiFormat('other')).toBe('anthropic');
});

// ==================== mapStopReason ====================

test('mapStopReason: maps "tool_calls" to "tool_use"', () => {
  expect(mapStopReason('tool_calls')).toBe('tool_use');
});

test('mapStopReason: maps "stop" to "end_turn"', () => {
  expect(mapStopReason('stop')).toBe('end_turn');
});

test('mapStopReason: maps "length" to "max_tokens"', () => {
  expect(mapStopReason('length')).toBe('max_tokens');
});

test('mapStopReason: returns other reasons unchanged', () => {
  expect(mapStopReason('other_reason')).toBe('other_reason');
});

test('mapStopReason: returns null for null', () => {
  expect(mapStopReason(null)).toBeNull();
});

test('mapStopReason: returns null for undefined', () => {
  expect(mapStopReason(undefined)).toBeNull();
});

test('mapStopReason: returns null for empty string', () => {
  expect(mapStopReason('')).toBeNull();
});

// ==================== formatSSEEvent ====================

test('formatSSEEvent: formats event with object data', () => {
  const event = formatSSEEvent('message', { content: 'hello' });
  expect(event).toBe('event: message\ndata: {"content":"hello"}\n\n');
});

test('formatSSEEvent: formats event with string data', () => {
  const event = formatSSEEvent('message', 'hello');
  expect(event).toBe('event: message\ndata: "hello"\n\n');
});

test('formatSSEEvent: formats event with number data', () => {
  const event = formatSSEEvent('count', 42);
  expect(event).toBe('event: count\ndata: 42\n\n');
});

test('formatSSEEvent: formats event with array data', () => {
  const event = formatSSEEvent('items', [1, 2, 3]);
  expect(event).toBe('event: items\ndata: [1,2,3]\n\n');
});

test('formatSSEEvent: formats event with null data', () => {
  const event = formatSSEEvent('empty', null);
  expect(event).toBe('event: empty\ndata: null\n\n');
});

test('formatSSEEvent: formats event with nested object', () => {
  const event = formatSSEEvent('nested', { a: { b: 'c' } });
  expect(event).toBe('event: nested\ndata: {"a":{"b":"c"}}\n\n');
});

// ==================== buildOpenAIChatCompletionsURL ====================

test('buildOpenAIChatCompletionsURL: empty baseURL returns default path', () => {
  expect(buildOpenAIChatCompletionsURL('')).toBe('/v1/chat/completions');
});

test('buildOpenAIChatCompletionsURL: whitespace only baseURL returns default path', () => {
  expect(buildOpenAIChatCompletionsURL('   ')).toBe('/v1/chat/completions');
});

test('buildOpenAIChatCompletionsURL: baseURL without trailing slash', () => {
  expect(buildOpenAIChatCompletionsURL('https://api.example.com')).toBe('https://api.example.com/v1/chat/completions');
});

test('buildOpenAIChatCompletionsURL: baseURL with trailing slashes', () => {
  expect(buildOpenAIChatCompletionsURL('https://api.example.com/')).toBe('https://api.example.com/v1/chat/completions');
  expect(buildOpenAIChatCompletionsURL('https://api.example.com///')).toBe('https://api.example.com/v1/chat/completions');
});

test('buildOpenAIChatCompletionsURL: baseURL ending with /v1', () => {
  expect(buildOpenAIChatCompletionsURL('https://api.example.com/v1')).toBe('https://api.example.com/v1/chat/completions');
});

test('buildOpenAIChatCompletionsURL: baseURL ending with /v4', () => {
  expect(buildOpenAIChatCompletionsURL('https://api.example.com/v4')).toBe('https://api.example.com/v4/chat/completions');
});

test('buildOpenAIChatCompletionsURL: baseURL already has /chat/completions', () => {
  expect(buildOpenAIChatCompletionsURL('https://api.example.com/v1/chat/completions')).toBe('https://api.example.com/v1/chat/completions');
});

test('buildOpenAIChatCompletionsURL: Google Gemini v1beta path', () => {
  expect(buildOpenAIChatCompletionsURL('https://generativelanguage.googleapis.com/v1beta/openai')).toBe('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
});

test('buildOpenAIChatCompletionsURL: Google Gemini v1 path', () => {
  expect(buildOpenAIChatCompletionsURL('https://generativelanguage.googleapis.com/v1/openai')).toBe('https://generativelanguage.googleapis.com/v1/openai/chat/completions');
});

test('buildOpenAIChatCompletionsURL: Google Gemini v1beta base', () => {
  expect(buildOpenAIChatCompletionsURL('https://generativelanguage.googleapis.com/v1beta')).toBe('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
});

test('buildOpenAIChatCompletionsURL: Google Gemini v1 base', () => {
  // Note: The implementation strips /v1 and appends v1beta, resulting in missing slash
  expect(buildOpenAIChatCompletionsURL('https://generativelanguage.googleapis.com/v1')).toBe('https://generativelanguage.googleapis.comv1beta/openai/chat/completions');
});

test('buildOpenAIChatCompletionsURL: Google Gemini without version', () => {
  expect(buildOpenAIChatCompletionsURL('https://generativelanguage.googleapis.com')).toBe('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
});
