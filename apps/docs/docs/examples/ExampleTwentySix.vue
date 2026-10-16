<template>
  <div vb-display="flex" vb-gap="1rem">
    <!-- prefixing the token with br -->
    <img
      src="/victor-osimhen.jpg"
      alt="Victor Osimhen"
      title="Victor Osimhen"
      vb-height="50px"
      vb-width="50px"
      vb-object-fit="cover"
      vb-border-radius="br-full"
    />

    <!-- or via CSS custom properties -->
    <img
      src="/victor-osimhen.jpg"
      alt="Victor Osimhen"
      title="Victor Osimhen"
      vb-height="50px"
      vb-width="50px"
      vb-object-fit="cover"
      vb-border-radius="var(--border-radius-md)"
    />
  </div>
</template>
