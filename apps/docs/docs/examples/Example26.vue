<template>
  <v-box display="flex" gap="1rem">
    <!-- prefixing the token with br -->
    <v-box
      is="img"
      src="/images/victor-osimhen.jpg"
      alt="Victor Osimhen"
      title="Victor Osimhen"
      height="50px"
      width="50px"
      object-fit="cover"
      border-radius="br-full"
    />

    <!-- or via CSS custom properties -->
    <v-box
      is="img"
      src="/images/victor-osimhen.jpg"
      alt="Victor Osimhen"
      title="Victor Osimhen"
      height="50px"
      width="50px"
      object-fit="cover"
      border-radius="var(--border-radius-md)"
    />
  </v-box>
</template>
