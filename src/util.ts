import { Dimensions, LayoutRectangle } from 'react-native';

export const isSmallScreen = (smallerThan: number = 375) => (
  Dimensions.get('screen').width < smallerThan
);

export const isRectangleSizeEqual = (a: LayoutRectangle, b: LayoutRectangle) => !!(
  a && b && (a.width === b.width) && (a.height === b.height)
);

export const interpolate = (min: number, max: number, group: number[][]) => {
  const diff = max - min;

  return group.map(steps => steps.map(value => min + Math.min(Math.max(0, value), 1) * diff));
};
