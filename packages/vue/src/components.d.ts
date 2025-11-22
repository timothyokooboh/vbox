import type VBox from "@/VBox.vue";

declare module "vue" {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }
}
