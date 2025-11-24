import type VBox from "@/components/VBox.vue";

declare module "vue" {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }
}
