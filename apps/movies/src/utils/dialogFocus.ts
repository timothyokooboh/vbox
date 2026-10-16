/** Safari does not focus buttons on pointer activation. Radix records the active
 * element when opening, so focus the actual trigger before that snapshot. */
export function focusDialogTrigger(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.focus({ preventScroll: true });
  }
}
