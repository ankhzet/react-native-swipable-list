import { ActionAnimatorsDefinition, AnimationTarget } from './Animators';

export type SwipeActionComponents = 'container' | 'underlay' | 'text' | 'itemContainer';

export interface SwipeActionAnimatorsDefinition<A extends string> extends ActionAnimatorsDefinition<A, SwipeActionComponents> {

}

export class ActionDefinitions<A extends string, D extends SwipeActionAnimatorsDefinition<A> = SwipeActionAnimatorsDefinition<A>> {
  private readonly definitions: D[];

  constructor(definitions: D[]) {
    this.definitions = definitions;
  }

  allActions() {
    return this.definitions.map(definition => definition.action);
  }

  isAnimationTarget(definition: D, animate: AnimationTarget) {
    return !!(definition.targets & animate);
  }

  getDefinitions(actions: A[] | undefined, animate: AnimationTarget) {
    return this.definitions.filter(definition => (
      !(actions && !actions.includes(definition.action)) &&
      this.isAnimationTarget(definition, animate)
    ));
  }
}
