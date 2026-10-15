<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const reverse = ref(false);
const width = ref(450);
const contribution = ref(0);
const values = ['red', null, undefined] as const;
const media: VBoxStyles[] = [
  { mq: { '@media (min-width: 40rem)': { color: 'green' } } },
  { mq: { '@media (min-width: 500px)': { color: 'red' } } },
];
const container: VBoxStyles[] = [
  { cq: { '@container card (min-width: 20rem)': { color: 'blue' } } },
  { cq: { '@container card (min-width: 400px)': { color: 'purple' } } },
];
</script>
<template>
  <section
    aria-label="Media and container contexts"
    vb-container-type="inline-size"
    vb-container-name="Outer"
    vb-width="900px"
  >
    <button @click="reverse = !reverse">Reverse query sources</button>
    <button @click="width = width === 450 ? 250 : 450">
      Resize query container
    </button>
    <button @click="contribution = (contribution + 1) % 3">
      Cycle query contribution
    </button>
    <div
      vb-container-type="inline-size"
      vb-container-name="card"
      :vb-width="`${width}px`"
    >
      <p
        v-for="id in reverse ? ['b', 'a'] : ['a', 'b']"
        :key="id"
        :data-testid="`query-media-${id}`"
        :vb="id === 'a' ? media : [...media].reverse()"
      >
        Media overlap
      </p>
      <p
        data-testid="query-container"
        :vb="reverse ? [...container].reverse() : container"
      >
        Container overlap
      </p>
      <p data-testid="query-families" :vb="[...container, ...media]">
        Cross-family overlap
      </p>
      <p
        data-testid="query-named"
        vb-color="black"
        :vb-cq="{
          '@container Outer (min-width: 700px)': { color: 'blue' },
          '@container (min-width: 700px)': { color: 'red' },
        }"
      >
        Named ancestor
      </p>
      <p
        data-testid="query-wrong-name"
        vb-color="black"
        :vb-cq="{ '@container outer (min-width: 1px)': { color: 'red' } }"
      >
        Case-sensitive container
      </p>
      <button
        data-testid="query-combined"
        vb-color="black"
        :vb-hover="{ color: 'red' }"
        :vb="{
          mq: {
            '@media (min-width: 700px)': {
              cq: {
                '@container card (min-width: 400px)': {
                  dark: { md: { color: 'blue', hover: { color: 'orange' } } },
                },
              },
            },
          },
        }"
      >
        All conditions
      </button>
      <p
        data-testid="query-withdrawal"
        :vb="[
          {
            mq: {
              '@media (min-width: 500px)': { color: 'green', opacity: 0.6 },
            },
          },
          {
            mq: {
              '@media (min-width: 500px)': {
                color: values[contribution],
                opacity: null,
              },
            },
          },
        ]"
        :vb-cq="{
          '@container card (min-width: 400px)': { border: '3px solid blue' },
        }"
      >
        Withdraw matching leaf
      </p>
      <p
        data-testid="query-branch-withdrawal"
        :vb="[
          { mq: { '@media (min-width: 500px)': { color: 'green' } } },
          {
            mq: {
              '@media (min-width: 500px)':
                contribution === 0
                  ? { color: 'red' }
                  : contribution === 1
                    ? null
                    : undefined,
            },
          },
        ]"
      >
        Withdraw matching group
      </p>
      <p
        data-testid="query-direct"
        :vb-mq="{
          '@media (min-width: 500px)': { color: values[contribution] },
        }"
        :vb="{ mq: { '@media (min-width: 500px)': { color: 'green' } } }"
      >
        Direct beats grouped
      </p>
      <p
        data-testid="query-refinement"
        :vb="[
          {
            mq: {
              '@media (min-width: 40rem)': {
                mq: { '@media (min-width: 500px)': { color: 'orange' } },
              },
            },
          },
          ...media,
        ]"
      >
        Query conjunction refines both
      </p>
      <p
        data-testid="query-breakpoint"
        :vb="{
          md: { color: 'blue' },
          mq: { '@media (min-width: 500px)': { color: 'red' } },
        }"
      >
        Named breakpoint rank
      </p>
      <div
        data-testid="query-parent-target"
        :vb="{
          hover: {
            mq: {
              '@media (min-width: 500px)': { '.query-child': { color: 'red' } },
            },
          },
        }"
      >
        <span data-testid="query-parent-padding">Hover parent only</span>
        <span class="query-child" data-testid="query-parent-child"
          >Parent-state child</span
        >
      </div>
      <div
        data-testid="query-child-target"
        :vb="{
          declarations: {
            '.query-child': {
              hover: { mq: { '@media (min-width: 500px)': { color: 'red' } } },
            },
          },
        }"
      >
        <span data-testid="query-child-padding">Hover parent only</span>
        <span class="query-child" data-testid="query-child-child"
          >Child-state child</span
        >
      </div>
    </div>
  </section>
</template>
