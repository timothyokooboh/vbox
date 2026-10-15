<script setup lang="ts">
import { ref } from 'vue';
import InteractionStyles from './InteractionStyles.vue';
import SourceComposition from './SourceComposition.vue';
import GroupedObject from './GroupedObject.vue';
import Vocabulary from './Vocabulary.vue';
import NormalSetup from './NormalSetup.vue';
import LocalDirective from './LocalDirective.vue';
import NativeScalar from './NativeScalar.vue';
import { VBox } from '@veebox/vue';
import { pva } from '@veebox/property-variance-authority';

const count = ref(0);
const badge = pva({
  variants: {
    intent: {
      success: { color: 'white', bg: 'green' },
      danger: { color: 'white', bg: 'red' },
    },
  },
  defaultVariants: { intent: 'success' },
});
</script>
<template>
  <main>
    <NativeScalar />
    <Vocabulary />
    <GroupedObject />
    <SourceComposition />
    <InteractionStyles />
    <NormalSetup />
    <LocalDirective />
    <VBox is="button" type="button" :hover="{ color: 'green' }"
      >Hover baseline</VBox
    >
    <VBox is="p" data-testid="polymorphic" brand-color="cl-brand" px="12px"
      >Token and alias</VBox
    >
    <VBox as-child color="purple"
      ><a href="#content" data-testid="as-child">Adopted link</a></VBox
    >
    <VBox is="span" data-testid="pva" v-bind="badge()">Available</VBox>
    <VBox is="button" type="button" @click="count++">Count {{ count }}</VBox>
    <p data-testid="inference" color="red">Unpublished inference baseline</p>
  </main>
</template>
