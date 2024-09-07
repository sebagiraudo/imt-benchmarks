export const loadWasm = async () => {
  const wasm = await import("../assets/wasm/pkg/imt_poseidon_rs")

  await wasm.default()
  return wasm
}
