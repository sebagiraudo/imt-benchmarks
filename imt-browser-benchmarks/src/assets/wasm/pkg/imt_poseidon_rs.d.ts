/* tslint:disable */
/* eslint-disable */
/**
*/
export class IMT {
  free(): void;
/**
* @param {number} depth
* @param {string} zero_value
* @param {number} arity
* @param {(string)[]} leaves
*/
  constructor(depth: number, zero_value: string, arity: number, leaves: (string)[]);
/**
* @returns {string | undefined}
*/
  root(): string | undefined;
/**
* @returns {number}
*/
  depth(): number;
/**
* @returns {(string)[]}
*/
  leaves(): (string)[];
/**
* @returns {number}
*/
  arity(): number;
/**
* @param {string} leaf
*/
  insert(leaf: string): void;
/**
* @param {number} index
* @param {string} new_leaf
*/
  update(index: number, new_leaf: string): void;
/**
* @param {number} index
*/
  delete(index: number): void;
/**
* @param {number} index
* @returns {IMTMerkleProof}
*/
  create_proof(index: number): IMTMerkleProof;
/**
* @param {IMTMerkleProof} proof
* @returns {boolean}
*/
  verify_proof(proof: IMTMerkleProof): boolean;
}
/**
*/
export class IMTMerkleProof {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_imt_free: (a: number, b: number) => void;
  readonly __wbg_imtmerkleproof_free: (a: number, b: number) => void;
  readonly imt_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly imt_root: (a: number, b: number) => void;
  readonly imt_depth: (a: number) => number;
  readonly imt_leaves: (a: number, b: number) => void;
  readonly imt_arity: (a: number) => number;
  readonly imt_insert: (a: number, b: number, c: number, d: number) => void;
  readonly imt_update: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly imt_delete: (a: number, b: number, c: number) => void;
  readonly imt_create_proof: (a: number, b: number, c: number) => void;
  readonly imt_verify_proof: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
