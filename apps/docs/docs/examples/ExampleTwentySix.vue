<template>
  <div display="flex" gap="1rem">
    <!-- prefixing the token with br -->
    <img
      src="/victor-osimhen.jpg"
      alt="Victor Osimhen"
      title="Victor Osimhen"
      height="50px"
      width="50px"
      object-fit="cover"
      border-radius="br-full"
    />

    <!-- or via CSS custom properties -->
    <img
      src="/victor-osimhen.jpg"
      alt="Victor Osimhen"
      title="Victor Osimhen"
      height="50px"
      width="50px"
      object-fit="cover"
      border-radius="var(--border-radius-md)"
    />
  </div>
</template>
