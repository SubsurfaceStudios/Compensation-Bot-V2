import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { reactive, effect } from "@vue/reactivity";

export function setupReactiveData(name: string) {
  const file = join(__dirname, "..", "..", "data", name.concat(".json"));
  let parsed;

  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`Could not load config at ${file}`);
  }

  const config = reactive(parsed);
  effect(() => {
    writeFileSync(file, JSON.stringify(config, null, 2));
  });

  return config;
}
