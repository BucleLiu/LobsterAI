/**
 * Unit tests for path utilities
 * Tests path manipulation functions used in the renderer
 */
import { test, expect } from 'vitest';
import {
  getLastPathSegment,
  getCompactFolderName,
} from './path';

// ==================== getLastPathSegment ====================

test('getLastPathSegment: Unix path', () => {
  expect(getLastPathSegment('/home/user/documents')).toBe('documents');
});

test('getLastPathSegment: Windows path', () => {
  expect(getLastPathSegment('C:\\Users\\John\\Projects')).toBe('Projects');
});

test('getLastPathSegment: mixed separators', () => {
  expect(getLastPathSegment('/home/user\\documents/folder')).toBe('folder');
});

test('getLastPathSegment: trailing slash', () => {
  expect(getLastPathSegment('/home/user/documents/')).toBe('documents');
});

test('getLastPathSegment: multiple trailing slashes', () => {
  expect(getLastPathSegment('/home/user/documents///')).toBe('documents');
});

test('getLastPathSegment: trailing backslash', () => {
  expect(getLastPathSegment('C:\\Users\\John\\')).toBe('John');
});

test('getLastPathSegment: single segment', () => {
  expect(getLastPathSegment('documents')).toBe('documents');
});

test('getLastPathSegment: root path', () => {
  expect(getLastPathSegment('/')).toBe('/');
});

test('getLastPathSegment: empty string', () => {
  expect(getLastPathSegment('')).toBe('');
});

test('getLastPathSegment: whitespace only', () => {
  expect(getLastPathSegment('   ')).toBe('');
});

test('getLastPathSegment: with leading/trailing whitespace', () => {
  expect(getLastPathSegment('  /home/user/docs  ')).toBe('docs');
});

test('getLastPathSegment: path with dots', () => {
  expect(getLastPathSegment('/home/user/.config')).toBe('.config');
});

test('getLastPathSegment: path with spaces', () => {
  expect(getLastPathSegment('/home/user/My Documents')).toBe('My Documents');
});

test('getLastPathSegment: relative path', () => {
  expect(getLastPathSegment('./src/components')).toBe('components');
});

test('getLastPathSegment: parent directory', () => {
  expect(getLastPathSegment('../parent/child')).toBe('child');
});

// ==================== getCompactFolderName ====================

test('getCompactFolderName: returns last segment', () => {
  expect(getCompactFolderName('/home/user/documents')).toBe('documents');
});

test('getCompactFolderName: with maxLength - truncates from start', () => {
  expect(getCompactFolderName('/home/user/documents', 5)).toBe('ments');
});

test('getCompactFolderName: maxLength larger than name', () => {
  expect(getCompactFolderName('/home/user/docs', 100)).toBe('docs');
});

test('getCompactFolderName: maxLength equal to name length', () => {
  expect(getCompactFolderName('/home/user/docs', 4)).toBe('docs');
});

test('getCompactFolderName: maxLength of 1', () => {
  expect(getCompactFolderName('/home/user/documents', 1)).toBe('s');
});

test('getCompactFolderName: no maxLength', () => {
  expect(getCompactFolderName('/home/user/very-long-folder-name')).toBe('very-long-folder-name');
});

test('getCompactFolderName: empty path', () => {
  expect(getCompactFolderName('')).toBe('');
});

test('getCompactFolderName: maxLength 0', () => {
  expect(getCompactFolderName('/home/user/docs', 0)).toBe('docs');
});

test('getCompactFolderName: negative maxLength', () => {
  expect(getCompactFolderName('/home/user/docs', -5)).toBe('docs');
});

test('getCompactFolderName: Windows path with maxLength', () => {
  expect(getCompactFolderName('C:\\Users\\John\\VeryLongFolderName', 10)).toBe('FolderName');
});
