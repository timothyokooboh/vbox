<script setup lang="ts">
import { ref } from 'vue';
const changed = ref(false);
</script>
<template>
  <section aria-label="Advanced selectors">
    <button @click="changed = !changed">Update selector styles</button>
    <button
      data-testid="selector-pseudo-list"
      :vb-pseudos="{ ':hover, :focus': { color: 'red' } }"
    >
      Pseudo list
    </button>
    <div
      data-testid="selector-lists"
      :vb-declarations="{
        '.selector-a, .selector-b': { color: changed ? 'blue' : 'red' },
        '&:is(.active, .ready), [data-comma=\'a,b\']': {
          border: '2px solid purple',
        },
      }"
      class="active"
    >
      <span class="selector-a">A inside</span>
      <span class="selector-b">B inside</span>
      <span data-comma="a,b">Comma inside</span>
    </div>
    <span
      data-testid="selector-content-attr"
      :data-label="changed ? 'Updated' : 'Label'"
      :vb-pseudos="{ '::before': { content: 'attr(data-label)' } }"
      >Attribute content</span
    >
    <span
      data-testid="selector-content-var"
      vb---label="'Custom'"
      :vb-pseudos="{ '::before': { content: 'var(--label)' } }"
      >Variable content</span
    >
    <div
      vb-container-type="inline-size"
      vb-container-name="selectorCard"
      vb-width="500px"
    >
      <button
        data-testid="selector-conditional"
        :vb="{
          pseudos: { '::before': { content: 'Base', color: 'red' } },
          dark: {
            md: {
              mq: {
                '@media (min-width: 700px)': {
                  cq: {
                    '@container selectorCard (min-width: 400px)': {
                      hover: {
                        pseudos: {
                          '::before': { content: 'Conditional', color: 'blue' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }"
      >
        Conditional pseudo
      </button>
    </div>
    <span
      data-testid="selector-withdrawal"
      :vb="[
        { pseudos: { '::before': { content: 'Base', color: 'red' } } },
        { pseudos: { '::before': changed ? null : { content: 'Override' } } },
      ]"
      >Pseudo withdrawal</span
    >
    <p
      data-testid="selector-specificity"
      class="active"
      :vb-declarations="{
        '&.active': { color: 'red' },
        '&': { color: 'blue' },
      }"
    >
      Specificity escape hatch
    </p>
    <p data-testid="selector-external" class="selector-external" vb-color="red">
      External cascade
    </p>
    <div class="selector-ancestor">
      <p
        data-testid="selector-parent-ref"
        :vb-declarations="{ '.selector-ancestor &': { color: 'purple' } }"
      >
        Ancestor reference
      </p>
    </div>
    <div
      :vb-declarations="{
        '.escaped\\,name, [data-amp=\'a&b\']': { color: 'green' },
      }"
    >
      <span class="escaped,name" data-testid="selector-escaped"
        >Escaped comma</span
      >
      <span data-amp="a&b" data-testid="selector-amp-attribute"
        >Literal ampersand</span
      >
    </div>
    <div
      data-testid="selector-descendant-state"
      :vb-declarations="{ ':hover': { color: 'red' } }"
    >
      Parent text
      <span data-testid="selector-descendant-state-child">Child target</span>
    </div>
    <span class="selector-a" data-testid="selector-outside-a">A outside</span>
    <span class="selector-b" data-testid="selector-outside-b">B outside</span>
    <span data-comma="a,b" data-testid="selector-outside-comma"
      >Comma outside</span
    >
  </section>
</template>
