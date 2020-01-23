import { observable } from 'mobx';

export interface Identifiable {
  _id: string;
}

export interface ObjectFactory<C, T> {
  (config: C): T;
}

export interface ObjectFactoryConfigHasher<C> {
  (config: C): string;
}

export class ObjectRepository<K, I> {
  @observable
  private readonly cache: Record<string, I> = {};

  private readonly factory: ObjectFactory<K, I>;
  private readonly hasher: ObjectFactoryConfigHasher<K>;

  constructor(factory: ObjectFactory<K, I>, hasher: ObjectFactoryConfigHasher<K> = String) {
    this.factory = factory;
    this.hasher = hasher;
  }

  getItemForKey(key: K): I {
    const prop = this.hasher(key);

    return this.cache[prop] || (
      this.cache[prop] = this.factory(key)
    );
  }

  removeForKey(key: K): boolean {
    return delete this.cache[this.hasher(key)];
  }

  public static ModelHasher = (entity: Identifiable) => entity._id;
}
