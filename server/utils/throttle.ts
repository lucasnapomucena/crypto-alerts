export const throttle = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let lastCall = 0;
  return function (...args: T) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
