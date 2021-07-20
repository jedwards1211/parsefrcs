export default function plugins(tapable, pluginObj) {
  for (let event in pluginObj) {
    const handler = pluginObj[event]
    if (handler instanceof Function) {
      tapable.plugin(event, handler)
    } else if (handler instanceof Object) {
      tapable.plugin(event, (tapable2) => plugins(tapable2, handler))
    }
  }
}
