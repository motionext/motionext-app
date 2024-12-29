import { IStateTreeNode, SnapshotIn } from "mobx-state-tree"

/**
 * Include this in the model in an action() block just under the props
 * to allow setting property values directly while retaining type safety
 * and also execute it in an action. This is useful because often repetitive
 * setter actions are needed that only update one prop.
 *
 * E.g.:
 *
 *  const UserModel = types.model("User")
 *    .props({
 *      name: types.string,
 *      age: types.number
 *    })
 *    .actions(withSetPropAction)
 *
 *   const user = UserModel.create({ name: "Rafael", age: 18 })
 *
 *   user.setProp("name", "John") // no type error
 *   user.setProp("age", 30)      // no type error
 *   user.setProp("age", "30")    // type error -- must be number
 */
export const withSetPropAction = <T extends IStateTreeNode>(mstInstance: T) => ({
  // generic setter for all properties
  setProp<K extends keyof SnapshotIn<T>, V extends SnapshotIn<T>[K]>(field: K, newValue: V) {
    // @ts-ignore - for some reason TS complains about this, but it still works fine
    mstInstance[field] = newValue
  },
})
