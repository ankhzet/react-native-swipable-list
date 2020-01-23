import { ObjectRepository } from '../ObjectRepository';
import { InterpolatorConfig, CompoundInterpolator } from './Interpolator';

export class InterpolatorRepository<C extends InterpolatorConfig, E extends string> extends ObjectRepository<C, CompoundInterpolator<E>> {
}
