/**
 * Unit tests for regionFilter utilities
 * Tests IM platform filtering based on language/region
 */
import { test, expect } from 'vitest';
import {
  CHINA_IM_PLATFORMS,
  GLOBAL_IM_PLATFORMS,
  getVisibleIMPlatforms,
} from './regionFilter';

// ==================== Constants ====================

test('CHINA_IM_PLATFORMS contains expected platforms', () => {
  expect(CHINA_IM_PLATFORMS).toContain('weixin');
  expect(CHINA_IM_PLATFORMS).toContain('dingtalk');
  expect(CHINA_IM_PLATFORMS).toContain('feishu');
  expect(CHINA_IM_PLATFORMS).toContain('wecom');
  expect(CHINA_IM_PLATFORMS).toContain('qq');
  expect(CHINA_IM_PLATFORMS).toContain('nim');
  expect(CHINA_IM_PLATFORMS).toContain('xiaomifeng');
  expect(CHINA_IM_PLATFORMS).toContain('popo');
});

test('CHINA_IM_PLATFORMS has correct length', () => {
  expect(CHINA_IM_PLATFORMS.length).toBe(8);
});

test('GLOBAL_IM_PLATFORMS contains expected platforms', () => {
  expect(GLOBAL_IM_PLATFORMS).toContain('telegram');
  expect(GLOBAL_IM_PLATFORMS).toContain('discord');
});

test('GLOBAL_IM_PLATFORMS has correct length', () => {
  expect(GLOBAL_IM_PLATFORMS.length).toBe(2);
});

// ==================== getVisibleIMPlatforms ====================

test('getVisibleIMPlatforms: zh returns China platforms only', () => {
  const platforms = getVisibleIMPlatforms('zh');
  expect(platforms).toEqual(CHINA_IM_PLATFORMS);
  expect(platforms).not.toContain('telegram');
  expect(platforms).not.toContain('discord');
});

test('getVisibleIMPlatforms: en returns all platforms', () => {
  const platforms = getVisibleIMPlatforms('en');
  expect(platforms).toContain('weixin');
  expect(platforms).toContain('dingtalk');
  expect(platforms).toContain('feishu');
  expect(platforms).toContain('telegram');
  expect(platforms).toContain('discord');
  expect(platforms.length).toBe(CHINA_IM_PLATFORMS.length + GLOBAL_IM_PLATFORMS.length);
});

test('getVisibleIMPlatforms: zh result is readonly type', () => {
  const platforms = getVisibleIMPlatforms('zh');
  // Type checking - the return type is readonly string[]
  // We verify the function returns the expected array without modification
  expect(platforms).toEqual(CHINA_IM_PLATFORMS);
  // Runtime check - TypeScript readonly doesn't prevent runtime mutation,
  // but we document that the returned array should not be modified
  expect(Object.isFrozen(platforms)).toBe(false); // Arrays are not frozen by default
});

test('getVisibleIMPlatforms: en result contains China platforms first', () => {
  const platforms = getVisibleIMPlatforms('en');
  // China platforms should come first
  CHINA_IM_PLATFORMS.forEach((platform, index) => {
    expect(platforms[index]).toBe(platform);
  });
});

test('getVisibleIMPlatforms: en result contains global platforms after China platforms', () => {
  const platforms = getVisibleIMPlatforms('en');
  const chinaLength = CHINA_IM_PLATFORMS.length;
  GLOBAL_IM_PLATFORMS.forEach((platform, index) => {
    expect(platforms[chinaLength + index]).toBe(platform);
  });
});
