import {
  defineConfig,
  resolveVBoxConfig,
  type Breakpoints,
} from '@veebox/core';
const config = defineConfig({ breakpoints: { md: '51rem' } });
export const completeBreakpoints: Breakpoints =
  resolveVBoxConfig(config).breakpoints;
