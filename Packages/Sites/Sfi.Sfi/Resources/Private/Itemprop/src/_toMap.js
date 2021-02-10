export default function objectToMap(obj) {
  const map = new Map();

  for (const key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}
