import { Animated, StyleProp } from 'react-native';

export interface Interpolator<E> {
  (animated: Animated.Value): StyleProp<E>;
}

export interface InterpolatorConfig {
  start: number;
  total: number;
  width: number;
  height: number;
}

export interface ConfigFactory<C extends InterpolatorConfig> {
  (key: any): Partial<C>;
}

export interface InterpolatorFactory<C extends InterpolatorConfig, E = any> {
  (config: C): Interpolator<E>;
}

export class CompoundInterpolator<E extends string> extends Map<E, Interpolator<any>> {
  static createFactoryFromElementFactories<C extends InterpolatorConfig, E extends string>(factories: Map<E, InterpolatorFactory<C, any>>) {
    return (config: C) => new this(
      [...factories.entries()]
        .map(([element, factory]) => [element, factory(config)]),
    );
  }

  interpolate(animated: Animated.Value): Record<E, StyleProp<any>> {
    const result: Record<E, StyleProp<any>> = {} as any;

    for (const [element, interpolator] of this.entries()) {
      result[element] = interpolator(animated);
    }

    return result;
  }
}

export const createInterpolator = (
  <C extends InterpolatorConfig, E = any>
  (interpolatorFactory: InterpolatorFactory<C, E>) => interpolatorFactory
);
