<script setup lang="ts">
import {
  createApp,
  defineComponent,
  h,
  onMounted,
  onBeforeUnmount,
  ref,
} from 'vue';
import { VBoxPlugin, useVBoxStyleBinding } from '@veebox/vue';
import type { Breakpoints } from '@veebox/core';
const host = ref<HTMLElement>();
const apps: ReturnType<typeof createApp>[] = [];
const sources = Object.freeze({
  md: { color: 'blue' },
  sm: { color: 'red' },
  color: 'black',
});
onMounted(() => {
  const configs: Array<[string, Partial<Breakpoints>]> = [
    ['tied', { sm: '40rem', md: '640px' }],
    ['separate', { sm: '40rem', md: '60rem' }],
    ['reversed', { sm: '60rem', md: '40rem' }],
  ];
  for (const [name, breakpoints] of configs) {
    const container = document.createElement('div');
    host.value!.append(container);
    const app = createApp(
      defineComponent({
        setup() {
          const bind = useVBoxStyleBinding();
          const revision = ref(0);
          return () =>
            h(
              'button',
              bind(
                {},
                {
                  'data-testid': `config-${name}`,
                  onClick: () => revision.value++,
                },
                sources,
              ),
              `Register ${name}: ${revision.value}`,
            );
        },
      }),
    ).use(VBoxPlugin, { enableDefaultTheme: false, breakpoints });
    app.mount(container);
    apps.push(app);
  }
});
onBeforeUnmount(() => apps.forEach((app) => app.unmount()));
</script>
<template>
  <section aria-label="Independent configuration consumers" ref="host" />
</template>
