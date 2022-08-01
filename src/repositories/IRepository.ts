export interface ISave<T> {
  save(entity: T): Promise<any>
}

export interface IGet<T, TId> {
  get(id: TId): Promise<T>
}

export interface IDelete<TId> {
  delete(id: TId): Promise<any>
}
