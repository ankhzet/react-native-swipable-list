import { observable, action } from 'mobx';
import { Animated } from 'react-native';

import { ObjectRepository } from '../ObjectRepository';
import { CompoundInterpolator, ConfigFactory, InterpolatorConfig } from './Interpolator';
import { InterpolatorRepository } from './InterpolatorRepository';

export type RepositoriesHash<A extends string, E extends string, C extends InterpolatorConfig = any> = Map<A, InterpolatorRepository<C, E>>;

export class Animator<C extends InterpolatorConfig, A extends string, E extends string, R extends RepositoriesHash<A, E, C> = RepositoriesHash<A, E, C>> {
  private readonly configFactory: ConfigFactory<C>;
  private readonly interpolators: R;

  @observable
  private readonly cache: Record<A, C> = {} as any;
  private readonly _timed: Record<A, Animated.CompositeAnimation> = {} as any;
  private _reverse?: A[];
  private animated: ObjectRepository<A, Animated.Value>;

  constructor(configFactory: ConfigFactory<C>, interpolators: R) {
    this.configFactory = configFactory;
    this.interpolators = interpolators;
    this.animated = new ObjectRepository(this.createAnimated);
  }

  createAnimated = (interpolatorId: A) => {
    return new Animated.Value(this.getInterpolatorConfig(interpolatorId).start);
  };

  get reverseActions() {
    if (!this._reverse) {
      this._reverse = [...this.interpolators.keys()].reverse();
    }

    return this._reverse;
  }

  mergeInterpolatorConfig(interpolatorId: A, config: Partial<C>) {
    this.cache[interpolatorId] = Object.assign(
      this.getInterpolatorConfig(interpolatorId),
      config,
    );
  }

  @action
  mergeInterpolatorsConfig(config: Partial<C>) {
    for (const interpolatorId of this.reverseActions) {
      this.mergeInterpolatorConfig(interpolatorId, config);
    }
  }

  getInterpolatorConfig(interpolatorId: A): C {
    return this.cache[interpolatorId] || this.configFactory(interpolatorId);
  }

  getInterpolator(interpolatorId: A): CompoundInterpolator<any> {
    return this.interpolators.get(interpolatorId)!.getItemForKey(
      this.getInterpolatorConfig(interpolatorId),
    );
  }

  updateValue(interpolatorId: A, value: number) {
    this.animated.getItemForKey(interpolatorId).setValue(value);
  }

  getInterpolatedStyle = (interpolatorId: A) => {
    return this.getInterpolator(interpolatorId).interpolate(
      this.animated.getItemForKey(interpolatorId),
    );
  };

  getInterpolatedStyles = () => {
    const compound: Record<string, any[]> = {} as any;

    for (const styles of this.reverseActions.map(this.getInterpolatedStyle)) {
      for (const [element, style] of Object.entries(styles)) {
        if (compound[element]) {
          compound[element].push(style);
        } else {
          compound[element] = [style];
        }
      }
    }

    return compound;
  };

  inProcess(interpolatorId: A) {
    return this._timed[interpolatorId];
  }

  timing(interpolatorId: A, finished: () => any, config?: Animated.AnimationConfig) {
    let got = this.inProcess(interpolatorId);

    if (!got) {
      const { start } = this.getInterpolatorConfig(interpolatorId);

      got = Animated.timing(this.animated.getItemForKey(interpolatorId), {
        duration: 200,
        toValue: 1 - start,
        ...config,
      });
      got.start(async () => {
        await finished();
        delete this._timed[interpolatorId];
      });

      this._timed[interpolatorId] = got;
    }

    return got;
  }
}

