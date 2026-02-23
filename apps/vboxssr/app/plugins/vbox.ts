import { VBoxPlugin } from '@veebox/vue';
// import vboxConfig from "../../vbox.config";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VBoxPlugin);
});
