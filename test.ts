const breakpoints = {
  laptop: 768,
  mobile: 0,
  desktop: 1200,
};

const sortedBreakpoints = Object.entries(breakpoints).sort(
  (a, b) => b[1] - a[1],
);
console.log(Object.fromEntries(sortedBreakpoints));
