import { Bench, Task } from "tinybench"
import { IMT, IMTMerkleProof } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"

import { loadWasm } from "./wasm-loader"

const generateTable = (task: Task) => {
  if (task && task.name && task.result) {
    return {
      Function: task.name,
      "ops/sec": task.result.error
        ? "NaN"
        : parseInt(task.result.hz.toString(), 10).toLocaleString(),
      "Average Time (ms)": task.result.error
        ? "NaN"
        : task.result.mean.toFixed(5),
      Samples: task.result.error ? "NaN" : task.result.samples.length
    }
  }
}

export async function generateBenchmarks(samples: number) {
  const bench = new Bench({ time: 0, iterations: samples })

  const wasm = await loadWasm()
  const imtDepth = 16
  const imtZeroValue = "0"
  const imtArity = 2
  let imt_ts: IMT 

  let imt_wasm: any
  let index: number
  let imt_ts_proof: IMTMerkleProof
  let imt_wasm_proof: string[]

  bench
  .add(
    "IMTTs - Insert",
    async () => {
      imt_ts.insert("2")
    },
    {
      beforeAll: () => {
        imt_ts = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
      }
    }
  )
  .add(
    "IMTWasm - Insert",
    () => {
      imt_wasm.insert("2")
    },
    {
      beforeAll: () => {
        imt_wasm = new wasm.IMT(imtDepth, imtZeroValue, imtArity, [])
      }
    }
  )
  .add(
    "IMTTs - Update",
    () => {
      imt_ts.update(index, "2")
    },
    {
      beforeAll: () => {
        imt_ts = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
      },
      beforeEach: () => {
        imt_ts.insert("1")
        index = imt_ts.leaves.length - 1
      }
    }
  )
  .add(
    "IMTWasm - Update",
    () => {
      imt_wasm.update(index, "2")
    },
    {
      beforeAll: () => {
        imt_wasm = new wasm.IMT(imtDepth, imtZeroValue, imtArity, [])
      },
      beforeEach: () => {
        imt_wasm.insert("1")
        index = imt_wasm.leaves().length - 1
      }
    }
  )
  .add(
    "IMTTs - Delete",
    () => {
      imt_ts.delete(0)
    },
    {
      beforeAll: () => {
        imt_ts = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
        Array.from({ length: 10 }, (_, i) => imt_ts.insert(i))
      }
    }
  )
  .add(
    "IMTWasm - Delete",
    () => {
      imt_wasm.delete(0)
    },
    {
      beforeAll: () => {
        imt_wasm = new wasm.IMT(imtDepth, imtZeroValue, imtArity, [])
        Array.from({ length: 10 }, (_, i) => imt_wasm.insert(i.toString()))
      }
    }
  )
  .add(
    "IMTTs - GenerateProof",
    () => {
      imt_ts.createProof(index)
    },
    {
      beforeAll: () => {
        imt_ts = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
      },
      beforeEach: () => {
        imt_ts.insert("1")
        index = imt_ts.leaves.length - 1
      }
    }
  )
  .add(
    "IMTWasm - GenerateProof",
    () => {
      imt_wasm.create_proof(index)
    },
    {
      beforeAll: () => {
        imt_wasm = new wasm.IMT(imtDepth, imtZeroValue, imtArity, [])
      },
      beforeEach: () => {
        imt_wasm.insert("1")
        index = imt_wasm.leaves().length - 1
      }
    }
  )
  .add(
    "IMTTs - VerifyProof",
    () => {
      imt_ts.verifyProof(imt_ts_proof)
    },
    {
      beforeAll: () => {
        imt_ts = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
        Array.from({ length: 10 }, (_, i) => imt_ts.insert(i))
        imt_ts_proof = imt_ts.createProof(0)
      }
    }
  )
  .add(
    "IMTWasm - VerifyProof",
    () => {
      imt_wasm.verify_proof(imt_wasm_proof)
    },
    {
      beforeAll: () => {
        imt_wasm = new wasm.IMT(imtDepth, imtZeroValue, imtArity, [])
        Array.from({ length: 10 }, (_, i) => imt_wasm.insert(i.toString()))
        imt_wasm_proof = imt_wasm.create_proof(0)
      }
    }
  )

  // await bench.warmup();
  await bench.run()

  const table = bench.table((task) => generateTable(task))

  // Add column to show how many times the IMTWasm is faster than the IMTTs.
  table.map((rowInfo, i) => {
    if (rowInfo && !(rowInfo["Function"] as string).includes("IMTWasm")) {
      rowInfo["IMTTs"] = ""
    } else if (rowInfo) {
      const IMTAvgExecTime = bench.tasks[i - 1].result?.mean

      const IMTWasmAvgExecTime = bench.tasks[i]!.result?.mean

      if (
        IMTAvgExecTime === undefined ||
        IMTWasmAvgExecTime === undefined
      )
        return

      if (IMTAvgExecTime > IMTWasmAvgExecTime) {
        rowInfo["Relative to IMT"] = `${(
          IMTAvgExecTime / IMTWasmAvgExecTime
        ).toFixed(2)} x faster`
      } else {
        rowInfo["Relative to IMT"] = `${(
          IMTWasmAvgExecTime / IMTAvgExecTime
        ).toFixed(2)} x slower`
      }
    }
  })

  // Store the data in assets so users can see my results without running the benchmarks.
  // const jsonOutput = JSON.stringify(table, null, 2)
  // console.log(jsonOutput)

  // console.log(bench.results)

  return table
}
