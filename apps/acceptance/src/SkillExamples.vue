<script setup lang="ts">
import SemanticCollision from './skill-examples/SemanticCollision.vue';
import Variants from './skill-examples/Variants.vue';
import Forwarding from './skill-examples/Forwarding.vue';
import Conditions from './skill-examples/Conditions.vue';
import EvaluatedSemantic from './skill-evaluation/Semantic.vue';
import EvaluatedVariants from './skill-evaluation/Variants.vue';
import EvaluatedForwarding from './skill-evaluation/FragmentCaller.vue';
import EvaluatedConditions from './skill-evaluation/Conditions.vue';
</script>
<template>
  <section aria-label="Installable skill examples">
    <SemanticCollision />
    <Variants />
    <Forwarding />
    <Conditions />
    <EvaluatedSemantic />
    <EvaluatedVariants />
    <EvaluatedForwarding />
    <EvaluatedConditions />
  </section>
</template>
