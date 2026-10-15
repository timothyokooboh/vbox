<template>
  <section>
    <p
      data-testid="custom-properties"
      vb---Accent="40px"
      vb---accent="90px"
      vb-width="var(--Accent)"
      vb-height="var(--accent)"
    >
      Case-sensitive CSS variables
    </p>
    <p
      data-testid="aliases"
      vb-brand-color="cl-reference"
      vb-pad-2="sp-larger"
      vb-max-w="200px"
      vb-measure="120px"
      vb-border="2px solid cl-brand"
      vbWebkitUserSelect="none"
    >
      Aliases and tokens
    </p>
    <p data-testid="camel-alias" vbBrandColor="cl-brand" vbPad2="8px">
      Camel aliases
    </p>
  </section>
</template>
