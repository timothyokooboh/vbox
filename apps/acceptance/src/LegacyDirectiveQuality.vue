<script setup lang="ts">
import {
  createApp,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  withDirectives,
  type App,
} from 'vue';
import { VBoxPlugin, vboxRuntimeDirective } from '@veebox/vue';

const tone = ref('red');
const contribution = ref<Record<string, string> | null>({ color: 'red' });
const SharedAction = defineComponent({
  setup() {
    return () =>
      withDirectives(
        h(
          'button',
          {
            type: 'button',
            class: 'directive-authored-child',
            'data-testid': 'directive-shared-action',
          },
          'Shared directive action',
        ),
        [[vboxRuntimeDirective, { color: 'red' }]],
      );
  },
});

const widthHost = ref<HTMLElement | null>(null);
const heightHost = ref<HTMLElement | null>(null);
const breakpointHost = ref<HTMLElement | null>(null);
const apps: App[] = [];
const configuredStyles = {
  display: 'block',
  width: '40px',
  height: '40px',
  padding: '0px',
  border: '0px',
  color: 'black',
  accent: '64px',
  sm: { color: 'purple' },
};

onMounted(() => {
  const consumers = [
    { host: widthHost.value, name: 'width', alias: 'width', sm: '400px' },
    { host: heightHost.value, name: 'height', alias: 'height', sm: '400px' },
    {
      host: breakpointHost.value,
      name: 'breakpoint',
      alias: 'width',
      sm: '1200px',
    },
  ] as const;
  for (const consumer of consumers) {
    const app = createApp({
      setup() {
        return () =>
          withDirectives(
            h(
              'button',
              {
                type: 'button',
                'data-testid': `directive-app-${consumer.name}`,
              },
              `Configured ${consumer.name}`,
            ),
            [[vboxRuntimeDirective, configuredStyles]],
          );
      },
    }).use(VBoxPlugin, {
      enableDefaultTheme: false,
      classNamePrefix: 'directive-quality-app',
      aliases: { values: { accent: consumer.alias } },
      breakpoints: { sm: consumer.sm },
    });
    app.mount(consumer.host!);
    apps.push(app);
  }
});
onBeforeUnmount(() => apps.forEach((app) => app.unmount()));
</script>

<template>
  <section aria-label="Legacy directive quality">
    <h2>Legacy directive quality</h2>
    <button type="button" @click="tone = tone === 'red' ? 'green' : 'red'">
      Update directive hover
    </button>
    <button
      type="button"
      data-testid="directive-hover-changing"
      v-vbox-runtime="{ hover: { color: tone } }"
    >
      Changing directive hover
    </button>
    <button
      type="button"
      data-testid="directive-hover-stable"
      v-vbox-runtime="{ hover: { color: 'blue' } }"
    >
      Stable directive hover
    </button>
    <button
      type="button"
      data-testid="directive-longhand-last"
      v-vbox-runtime="{ padding: '8px', paddingLeft: '16px' }"
    >
      Directive longhand last
    </button>
    <button
      type="button"
      data-testid="directive-shorthand-last"
      v-vbox-runtime="{ paddingLeft: '16px', padding: '8px' }"
    >
      Directive shorthand last
    </button>
    <SharedAction
      class="directive-authored-caller"
      v-vbox-runtime:override="contribution"
    />
    <button type="button" @click="contribution = null">
      Withdraw directive caller
    </button>
    <button type="button" @click="contribution = { color: 'blue' }">
      Change directive caller
    </button>
    <button type="button" @click="contribution = { color: 'red' }">
      Reapply shared directive caller
    </button>
    <div ref="widthHost" />
    <div ref="heightHost" />
    <div ref="breakpointHost" />
  </section>
</template>
