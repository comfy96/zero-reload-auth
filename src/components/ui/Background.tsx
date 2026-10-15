/**
 * Page backdrop. The redesign keeps backgrounds flat and solid —
 * no gradients, glows, grids or blurred orbs.
 */
export function Background() {
  return <div aria-hidden className="fixed inset-0 -z-10 bg-background" />;
}
