import { interpolate } from '../util';
import { createInterpolator, InterpolatorFactory, InterpolatorConfig } from './Interpolator';

export interface SwipeActionConfig extends InterpolatorConfig {
  edge: number;
}

export const paramsHash = (config: SwipeActionConfig) => `${config.edge}:${config.total}:${config.width}:${config.height}`;
export const swipeAnimationConfig = (init: Partial<SwipeActionConfig> = {}) => () => ({
  start: 0,
  total: 0,
  width: 0,
  height: 0,
  edge: 0,
  ...init,
});
export const scaleX = createInterpolator<SwipeActionConfig>(
  ({ width }: SwipeActionConfig) => {
    const inputRange = [-1, width / 2, width];
    // todo: bug with `scale: 0` was fixed only in RN 0.61.2, so use near-zero value instead
    //  https://github.com/facebook/react-native/commit/ab80001c905dbfb9354232c7a6c7e887736642b5
    const outputRange = [0.01, 0.01, 1];

    return (animated) => ({
      transform: [{
        scale: animated.interpolate({
          inputRange,
          outputRange,
          extrapolate: 'clamp',
        }),
      }],
    });
  },
);
export const expandY = createInterpolator<SwipeActionConfig>(
  ({ height }: SwipeActionConfig) => (animated) => ({
    height: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [height, 0],
      extrapolate: 'clamp',
    }),
  }),
);
const getStickyRanges = (startAt: number, endAt: number) => {
  const mark1 = startAt / (endAt || 1);
  const mark2 = Math.min(mark1 * 1.5, (1 + mark1 * 2) / 3);
  const mark3 = 1;

  return interpolate(0, endAt, [
    [0, mark1, mark2, mark3],
    [0, 0, 0.3 - mark1, 1 - mark1],
  ]);
};
export const stick = createInterpolator<SwipeActionConfig>(
  ({ total, edge }) => {
    const [inputRange, outs] = getStickyRanges(total, edge);
    const outputRange = outs.map(x => -x / 2);

    return (animated) => ({
      transform: [{
        translateX: animated.interpolate({
          inputRange,
          outputRange,
          extrapolate: 'clamp',
        }),
      }]
    });
  },
);
export const expandX = createInterpolator<SwipeActionConfig>(
  ({ total, edge }) => {
    const [inputRange, outs] = getStickyRanges(total, edge);
    const translateOuts = outs.map(x => -x / 2);
    const scaleOuts = outs.map(x => 1 + x / (edge || 1));

    return (animated) => ({
      transform: [{
        translateX: animated.interpolate({
          inputRange,
          outputRange: translateOuts,
          extrapolate: 'clamp',
        }),
      }, {
        scaleX: animated.interpolate({
          inputRange,
          outputRange: scaleOuts,
          extrapolate: 'clamp',
        }),
      }]
    });
  },
);
export const combine = <C extends InterpolatorConfig, E = any>(factories: InterpolatorFactory<C, E>[]) => (
  createInterpolator<C>(
    (config: C) => {
      const interpolators = factories.map(factory => factory(config));

      return (animated) => {
        return (
          interpolators
            .map(interpolator => interpolator(animated))
            .reduce((acc: any, current: any) => {
              if (current.transform) {
                current.transform = (
                  acc.transform
                    ? acc.transform.concat(...current.transform)
                    : current.transform
                );
              }

              return Object.assign(acc, current);
            }, {})
        );
      };
    },
  )
);
