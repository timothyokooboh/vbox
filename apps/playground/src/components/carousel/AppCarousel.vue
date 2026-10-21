<template>
  <!-- <v-box is="h1" mb="4rem" text-align="center">
    A CSS only, keyboard accessible carousel!
  </v-box> -->

  <!--
   :pseudos="{
      '::scroll-button(*)': {
        border: 0,
        fontSize: '2rem',
        bg: 'none',
        color: 'black',
        opacity: 0.7,
        cursor: 'pointer',
      },
    }"
  -->

  <ul
    vb-w="100%"
    vb-min-h="50vh"
    vb-px="20px"
    vb-py="40px"
    vb-display="flex"
    vb-gap="4vw"
    vb-overflow-x="scroll"
    vb-scroll-snap-type="x mandatory"
    vb-anchor-name="--app-carousel"
    vb-scroll-marker-group="after"
    vb-scrollbar-width="none"
    :vb-declarations="{
      'li:nth-child(even)': {
        backgroundColor: 'cl-rose-50',
      },
      '&::scroll-button(*)': {
        position: 'absolute',
        positionAnchor: '--app-carousel',
        border: 0,
        fontSize: '2rem',
        background: 'none',
        color: 'black',
        opacity: 0.7,
        cursor: 'pointer',
        transition: 'scale 0.2s ease-in-out',
      },
      '&::scroll-button(*):hover, &::scroll-button(*):focus-visible': {
        opacity: 1,
      },
      '&::scroll-button(*):active': {
        scale: 0.9,
      },
      '&::scroll-button(*):disabled': {
        opacity: 0.2,
        cursor: 'unset',
      },
      '&::scroll-button(left)': {
        content: '◄',
        right: 'calc(anchor(left) - 50%)',
        bottom: 'calc(anchor(top) - 35px)',
      },
      '&::scroll-button(right)': {
        content: '►',
        left: 'calc(anchor(right) - 50%)',
        bottom: 'calc(anchor(top) - 35px)',
      },
      '&::scroll-marker-group': {
        position: 'absolute',
        positionAnchor: '--app-carousel',
        top: 'calc(anchor(bottom) - 80px)',
        justifySelf: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
      },
      'li::scroll-marker': {
        content: '',
        width: '16px',
        height: '16px',
        background: 'transparent',
        border: '2px solid black',
        borderRadius: '50%',
      },
      'li::scroll-marker:target-current': {
        backgroundColor: 'black',
      },
    }"
  >
    <li
      vb-list-style="none"
      vb-bg="cl-gray-50"
      vb-border="1px solid #dddddd"
      vb-p="20px"
      vb-flex="0 0 100%"
      vb-scroll-snap-align="center"
      vb-view-transition-name="carousel"
    >
      <h2>Introduction</h2>
      <p>
        It is possible to develop a fully accessible and functional carousel
        with only CSS.
      </p>
      <p>
        Modern CSS provides pseudo-elements and pseudo-classes that enable the
        creation of carousels using only CSS and HTML.
      </p>
      <p>
        The browser handles most of the scrolling and link references in an
        accessible, flexible, and consistent manner.
      </p>
    </li>

    <li
      vb-list-style="none"
      vb-bg="cl-gray-50"
      vb-border="1px solid #dddddd"
      vb-p="20px"
      vb-flex="0 0 100%"
      vb-scroll-snap-align="center"
      vb-view-transition-name="carousel"
    >
      <h2>Pseudo elements</h2>
      <p>
        You can use ::scroll-button() pseudo element to obtain browser generated
        scroll buttons that are accessible by default and whose styles can be
        easily customised.
      </p>

      <p>
        You can use ::scroll-marker-group and ::scroll-marker pseudo elements to
        obtain broswer generated scroll markers.
      </p>

      <p>
        ::scroll-marker:target-current can be used to style the scroll marker of
        the current page.
      </p>
    </li>

    <li
      vb-list-style="none"
      vb-bg="cl-gray-50"
      vb-border="1px solid #dddddd"
      vb-p="20px"
      vb-flex="0 0 100%"
      vb-scroll-snap-align="center"
    >
      <h2>Accessible by design</h2>
      <p>
        The resulting carousel is fully accessible without any extra aria roles
        or JavaScript.
      </p>
      <p>
        For instance, when focus is on the active scroll marker, pressing the
        left and right arrow keys enables navigation.
      </p>
      <p>
        When you are on the first page, the left scroll button automatically
        goes into a disabled state. Similarly, when on the last page, the right
        scroll button goes into a disabled state.
      </p>
    </li>

    <li
      vb-list-style="none"
      vb-bg="cl-gray-50"
      vb-border="1px solid #dddddd"
      vb-p="20px"
      vb-flex="0 0 100%"
      vb-scroll-snap-align="center"
    >
      <h2>Conclusion</h2>
      <p>This reveals the power of modern CSS features.</p>
      <p>
        However, not all modern browsers currently support
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::scroll-button"
          target="_blank"
          >::scroll-button()</a
        >,
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::scroll-marker-group"
          target="_blank"
          >::scroll-marker-group</a
        >
        and
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::scroll-marker"
          target="_blank"
          >::scroll-marker</a
        >.
      </p>
      <p>So their usage is currently experimental and for prototyping.</p>
    </li>
  </ul>
</template>
