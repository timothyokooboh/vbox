// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as CSS from "csstype";

declare module "csstype" {
  interface StandardProperties {
    // Allow any CSS Custom Properties
    [index: `--${string}`]: unknown;
  }
}
