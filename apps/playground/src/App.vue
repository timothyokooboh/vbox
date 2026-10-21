<script setup lang="ts">
import NativeApiExamples from './examples/NativeApiExamples.vue';
// import { VBox } from '@veebox/vue';
const users = [
  {
    id: 1,
    profile:
      'https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg',
    name: 'Rachel Greene',
    role: 'Actress',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 2,
    profile:
      'https://assets.goal.com/images/v3/blt6c282b5b9f6961a7/crop/MM5DKNBUG45DGMBWGQ5G433XMU5DAORQ/Ads%C4%B1z%20tasar%C4%B1m%20(9).jpg?auto=webp&format=pjpg&width=3840&quality=60',
    name: 'Victor Osihmen',
    role: 'Footballer',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 3,
    profile:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSERK-VSV02ODRTg0mMDsifjeQgdHKG47pRiQ&s',
    name: 'Sam Adeyemi',
    role: 'Pastor',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 4,
    profile:
      'https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg',
    name: 'Rachel Greene',
    role: 'Actress',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 5,
    profile:
      'https://assets.goal.com/images/v3/blt6c282b5b9f6961a7/crop/MM5DKNBUG45DGMBWGQ5G433XMU5DAORQ/Ads%C4%B1z%20tasar%C4%B1m%20(9).jpg?auto=webp&format=pjpg&width=3840&quality=60',
    name: 'Victor Osihmen',
    role: 'Footballer',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 6,
    profile:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSERK-VSV02ODRTg0mMDsifjeQgdHKG47pRiQ&s',
    name: 'Sam Adeyemi',
    role: 'Pastor',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 7,
    profile:
      'https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg',
    name: 'Rachel Greene',
    role: 'Actress',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 8,
    profile:
      'https://assets.goal.com/images/v3/blt6c282b5b9f6961a7/crop/MM5DKNBUG45DGMBWGQ5G433XMU5DAORQ/Ads%C4%B1z%20tasar%C4%B1m%20(9).jpg?auto=webp&format=pjpg&width=3840&quality=60',
    name: 'Victor Osihmen',
    role: 'Footballer',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 9,
    profile:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSERK-VSV02ODRTg0mMDsifjeQgdHKG47pRiQ&s',
    name: 'Sam Adeyemi',
    role: 'Pastor',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 10,
    profile:
      'https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg',
    name: 'Rachel Greene',
    role: 'Actress',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 11,
    profile:
      'https://assets.goal.com/images/v3/blt6c282b5b9f6961a7/crop/MM5DKNBUG45DGMBWGQ5G433XMU5DAORQ/Ads%C4%B1z%20tasar%C4%B1m%20(9).jpg?auto=webp&format=pjpg&width=3840&quality=60',
    name: 'Victor Osihmen',
    role: 'Footballer',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
  {
    id: 12,
    profile:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSERK-VSV02ODRTg0mMDsifjeQgdHKG47pRiQ&s',
    name: 'Sam Adeyemi',
    role: 'Pastor',
    description:
      'lorem ipsum dorsicolor lives in faraway paraguay and he is the manager of a mini restaurant based in kafanchan',
  },
];
import { keyframes } from '@veebox/core';
import { ref } from 'vue';
import ProductCard from './components/ProductCard.vue';
import AppCarousel from './components/carousel/AppCarousel.vue';
import AppButton from './AppButton.vue';

const fadeIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(-30px)',
  },
  '100%': {
    opacity: 1,
    transform: 'none',
  },
});

// console.log(fadeIn);

const gap = ref(3);

const handleClick = () => {
  console.log('spinall');
};
</script>

<template>
  <NativeApiExamples />
  <div vb-font-size=""></div>
  <AppButton
    vb-display="block"
    vb-w="fit-content"
    vb-fs="3xl"
    vb-radius="br-xl"
    :vb-bg="gap > 5 ? 'pink' : 'yellow'"
    vb-color="red"
    vb-text-decoration="none"
  >
    <a href="#" vb-font-size="">google gangs</a>
  </AppButton>
  <input vb-width="500px" />
  <div vb-bg="red" vb-width="500px">yes</div>
  <button
    vb-bg="cl-rose-500"
    vb-color="#fff"
    vb-border="none"
    vb-py="sp-1"
    vb-px="sp-3"
    vb-radius="3px"
    vb-cursor="pointer"
    TYPE="submit"
    vb-transition="background-color 0.2s"
    :vb-hover="{
      bg: 'cl-rose-400',
    }"
    v-on:click="handleClick"
  >
    hello there
  </button>
  <img
    vb-width="100px"
    vb-height="100px"
    vb-radius="30px"
    vb-object-fit="cover"
    src="https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg"
    alt=""
  />

  <h2
    vb-bg="cl-bg-product"
    vb-color="cl-brand"
    vb-font-size="fs-sm"
    :vb-mq="{
      '@media (min-width: 900px)': {
        fontSize: 'fs-3xl',
        color: 'cl-rose-700',
      },
    }"
  >
    yolo
  </h2>

  <p
    vb-my="0"
    vb-fs="fs-lg"
    vb-fw="thicker"
    vb-m-top="0rem"
    vb-mb="5px"
    vb-display="block"
    vb-font-size="fs-sm"
    vb-border-radius="br-full"
    vb-color="cl-blue-600"
    vb-border="sp-1 solid cl-red-600"
  >
    destiny
  </p>

  <img
    vb-w="50px"
    vb-h="50px"
    vb-border-radius="5px"
    vb-object-fit="cover"
    src="https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg"
    alt=""
  />

  <p
    vb-transition="color 0.2s"
    :vb-hover="{ color: 'blue' }"
    vb-color="cl-pink-600"
    vb-text-decoration="underline"
    vb-on-border="3px solid yellow"
    vb-mBottom="100px"
    samoa="red"
    vb-font-size="fs-7xl"
  >
    Oh my god!, it's working
  </p>

  <div
    vb-display="grid"
    vb-grid-template-columns="1fr 1fr"
    vb-gap="1rem"
    vb-mb="2rem"
    vb-p="1rem"
    vb-bg="cl-slate-100"
  >
    <section vb-py="200px" vb-bg="cl-blue-100">
      <h2 vb-bg-color="cl-red-200" vb-color="green" vb-fs="90px" vb-m="0">
        Native Vbox Syntax
      </h2>
      <p vb-color="cl-slate-800" vb-m="0">
        This paragraph uses explicit native styling with vb-* bindings.
      </p>
      <button
        aria-label="native action button"
        vb-bg="cl-emerald-600"
        vb-color="white"
        vb-p="0.6rem 1rem"
        vb-radius="br-md"
        :vb-hover="{ backgroundColor: 'var(--color-emerald-700)' }"
      >
        Native button
      </button>
    </section>

    <section>hello there</section>
  </div>

  <button @click="gap += 1">increment</button>
  <button @click="gap -= 1">decrement</button>
  <p>{{ gap }}</p>

  <img
    src="https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg"
    alt=""
    style="width: 100px; height: 100px"
    :vb-animation="`${fadeIn} 3s ease-in-out both`"
  />

  <img
    src="https://www.instyle.com/thmb/NIi7r7wEfEP0tfvniPJKDUrE_TQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-2036483655-70501e59e2e4477991d20e84aa953282.jpg"
    alt=""
    style="width: 50px; height: 50px"
    :vb-animation="`${fadeIn} 3s ease-in-out both`"
  />
  <AppCarousel />

  <div
    vb-display="flex"
    vb-flex-direction="column"
    vb-justify-content="center"
    vb-align-items="center"
    vb-gap="3rem"
    vb-py="15px"
  >
    <ProductCard />
  </div>

  <section
    vb-bg-color=""
    vb-display="grid"
    vb-backdrop-filter="blur(10px)"
    vb-border-color="cl-amber-800"
    vb-margin="sp-2"
    :vb-gap="`${gap}rem`"
    vb-grid-template-columns="1fr"
    :vb-sm="{
      gridTemplateColumns: 'repeat(2, 1fr)',
    }"
    :vb-md="{
      gridTemplateColumns: 'repeat(3, 1fr)',
    }"
    :vb-dark="{
      backgroundColor: '',
      '& img': {
        width: '100px',
        height: '100px',
      },
    }"
  >
    <div>
      <p
        v-if="false"
        vb-my="0"
        vb-fs="fs-lg"
        vb-fw="thicker"
        vb-m-top="0rem"
        vb-mb="5px"
        vb-display="block"
        vb-bg="cl-red-900"
        vb-font-size="fs-sm"
        vb-border-radius="br-full"
        vb-color="cl-blue-600"
      >
        destiny
      </p>
    </div>
    <div
      v-for="user in users"
      :key="user.id"
      vb-display="flex"
      vb-border="var(--font-size-sm) solid var(--color-yellow-900)"
      vb-radius="3px"
      vb-shadow="0 3px 20px rgba(0, 0, 0, 0.1)"
      vb-py="0.6rem"
      vb-px="0.4rem"
      vb-color="cl-red-400"
      vb-align-items="flex-start"
      vb-gap="1rem"
      vb-font-family="var(--font-weight-bolder)"
      vb-transition="transform 0.3s ease-in-out"
      :vb-hover="{
        color: 'cl-amber-500',
        fs: 'fs-3xl',
      }"
      :vb-pseudos="{
        ':hover': {
          transform: 'translateY(-2px)',
          bg: 'cl-emerald-400',
        },
      }"
    >
      <img
        :src="user.profile"
        :alt="user.name"
        vb-object-fit="cover"
        vb-h="calc(100% - 20px)"
        vb-w="70px"
        vb-border-radius="br-temi"
        :vb-animation="`${fadeIn} 3s ease-in-out both`"
      />

      <div>
        <div vb-d="flex" vb-flex-direction="column" vb-gap="0.3rem">
          <p
            vb-my="0"
            vb-fs="fs-lg"
            vb-fw="thicker"
            vb-m-top="0rem"
            vb-mb="5px"
            vb-display="block"
            vb-bg="cl-red-900"
            vb-font-size="fs-sm"
            vb-border-radius="br-full"
            vb-color="cl-blue-600"
          >
            {{ user.name }}
          </p>
          <div
            vb-fs="fs-xl"
            vb-bg-color="cl-fuchsia-600"
            vb-color="cl-blue-500"
          >
            {{ user.role }}cool stuff
          </div>
        </div>

        <div vb-color="cl-blue-500" vb-letter-spacing="-0.02em">
          {{ user.description }}
        </div>
      </div>
    </div>
  </section>

  <h1
    vb-text-decoration="underline"
    href="www.google.com"
    vb-color="cl-brand"
    vb-border="fs-xl solid cl-red-300"
    vb-box-shadow="var(--box-shadow-md)"
    :vb-declarations="{
      '--color-red-violet': 'indigo',
      bg: 'violet',
      '&:hover': {
        background: 'black',
      },
    }"
  >
    Hello world
    <div vb-color="var(--color-red-violet)">yes oo</div>
  </h1>
</template>

<style>
.rest {
  width: 250px;
  padding: 1rem;
  background-color: tomato;
  position: relative;
}

.rest::after {
  position: absolute;
  top: 0;
  right: 0;
  content: 'hello';
  color: '#fff';
}

.link {
  color: red;
}

.parent {
  display: flex;
  position: relative;
}
</style>
