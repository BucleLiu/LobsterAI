/**
 * 技能状态切片
 *
 * 管理技能列表和当前激活的技能 ID
 * 支持多技能同时激活
 *
 * @module store/slices/skillSlice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Skill } from '../../types/skill';

/**
 * 技能状态接口
 * @interface SkillState
 */
interface SkillState {
  /** 所有可用技能列表 */
  skills: Skill[];
  /** 当前会话中激活的技能 ID 数组（支持多选） */
  activeSkillIds: string[];
}

/**
 * 初始状态
 */
const initialState: SkillState = {
  skills: [],
  activeSkillIds: [],
};

/**
 * 技能状态切片
 *
 * @remarks
 * - skills: 所有可用技能列表
 * - activeSkillIds: 当前会话中激活的技能 ID 数组（支持多选）
 */
const skillSlice = createSlice({
  name: 'skill',
  initialState,
  reducers: {
    /**
     * 设置技能列表
     * 同时清理已不存在的激活技能 ID
     */
    setSkills: (state, action: PayloadAction<Skill[]>) => {
      state.skills = action.payload;
      // 移除已不存在的激活技能 ID
      state.activeSkillIds = state.activeSkillIds.filter(id =>
        action.payload.some(skill => skill.id === id)
      );
    },
    /**
     * 添加新技能
     */
    addSkill: (state, action: PayloadAction<Skill>) => {
      state.skills.push(action.payload);
    },
    /**
     * 更新技能
     */
    updateSkill: (state, action: PayloadAction<{ id: string; updates: Partial<Skill> }>) => {
      const index = state.skills.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.skills[index] = { ...state.skills[index], ...action.payload.updates };
      }
    },
    /**
     * 删除技能
     * 同时从激活列表中移除
     */
    deleteSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter(s => s.id !== action.payload);
      state.activeSkillIds = state.activeSkillIds.filter(id => id !== action.payload);
    },
    /**
     * 切换技能启用状态
     */
    toggleSkill: (state, action: PayloadAction<string>) => {
      const skill = state.skills.find(s => s.id === action.payload);
      if (skill) {
        skill.enabled = !skill.enabled;
      }
    },
    /**
     * 切换技能激活状态
     * 如果已激活则移除，否则添加
     */
    toggleActiveSkill: (state, action: PayloadAction<string>) => {
      const index = state.activeSkillIds.indexOf(action.payload);
      if (index === -1) {
        state.activeSkillIds.push(action.payload);
      } else {
        state.activeSkillIds.splice(index, 1);
      }
    },
    /**
     * 设置激活的技能 ID 列表
     */
    setActiveSkillIds: (state, action: PayloadAction<string[]>) => {
      state.activeSkillIds = action.payload;
    },
    /**
     * 清空所有激活的技能
     */
    clearActiveSkills: (state) => {
      state.activeSkillIds = [];
    },
  },
});

export const {
  setSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  toggleSkill,
  toggleActiveSkill,
  setActiveSkillIds,
  clearActiveSkills,
} = skillSlice.actions;

export default skillSlice.reducer;
