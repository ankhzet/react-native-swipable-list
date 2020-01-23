import {
  SwipeActionConfig,
  swipeAnimationConfig, paramsHash, combine,
  scaleX, stick, expandY, expandX,
} from './Animations';
import { CompoundInterpolator, InterpolatorFactory } from './Interpolator';
import { InterpolatorRepository } from './InterpolatorRepository';
import { RepositoriesHash, Animator } from './Animator';

export enum SwipeItemAnimators {
  ExpandX = 1,
  ScaleX = 2,
  Stick = 4,
  ExpandY = 8,
}

export enum AnimationTarget {
  None = 0,
  Action = 1,
  Item = 2,
  Both = 3, // 1 | 2
}

export interface ActionAnimatorsDefinition<A, E extends string> {
  action: A;
  targets: AnimationTarget;
  animators: Partial<Record<E, SwipeItemAnimators>>;
}

const AnimatorsMap = new Map([
  [SwipeItemAnimators.ScaleX, scaleX],
  [SwipeItemAnimators.ExpandX, expandX],
  [SwipeItemAnimators.Stick, stick],
  [SwipeItemAnimators.ExpandY, expandY],
]);

const combineAnimatorFactories = (animators: SwipeItemAnimators, resolved?: InterpolatorFactory<any, any>) => {
  for (const [animator, interpolatorFactory] of AnimatorsMap) {
    if ((animators & animator) !== animator) {
      continue;
    }

    resolved = (
      resolved
        ? combine([resolved, interpolatorFactory])
        : interpolatorFactory
    );
  }

  return resolved;
};

const createInterpolators = <A extends string, E extends string>(definitions: ActionAnimatorsDefinition<A, E>[]): RepositoriesHash<A, E> => (
  definitions.reduce(
    (acc, { action, animators }) => {
      const factories = new Map();

      for (const [element, useAnimators] of Object.entries<SwipeItemAnimators>(animators as any)) {
        const resolved = combineAnimatorFactories(useAnimators);

        if (resolved) {
          factories.set(element, resolved);
        }
      }

      if (factories.size) {
        acc.set(action, new InterpolatorRepository(
          CompoundInterpolator.createFactoryFromElementFactories(factories),
          paramsHash,
        ));
      }

      return acc;
    },
    new Map(),
  )
);

export class CompoundAnimator<A extends string, E extends string> extends Animator<SwipeActionConfig, A, E> {
  constructor(definitions: ActionAnimatorsDefinition<A, E>[], config: Partial<SwipeActionConfig> = { start: 0 }) {
    super(
      swipeAnimationConfig(config),
      createInterpolators(definitions),
    );
  }
}
