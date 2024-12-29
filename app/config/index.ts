/**
 * Import configuration objects from the config.dev.js file
 * or the config.prod.js file depending on whether in __DEV__ or not.
 *
 * Note not to gitignore these files. Unlike web servers, just because they are
 * not checked into the repository doesn't mean they are secure. In fact, ship
 * a JavaScript bundle with every config variable in plain text.
 * Anyone downloading the app can easily extract them.
 *
 * If in doubt, just bundle the app and then search the bundle for one of the
 * config variable values. It will be found there.
 *
 * Read more here: https://reactnative.dev/docs/security#storing-sensitive-info
 */
import BaseConfig from "./config.base"
import ProdConfig from "./config.prod"
import DevConfig from "./config.dev"

let ExtraConfig = ProdConfig

if (__DEV__) {
  ExtraConfig = DevConfig
}

const Config = { ...BaseConfig, ...ExtraConfig }

export default Config
