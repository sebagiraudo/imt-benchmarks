# IMT - Rust vs TS

The purpose of this project is to benchmark and compare an IMT Rust implementation with a JavaScript library.

This project is based on a similar project where the implementations of LeanIMT were compared. Link: https://github.com/vplasencia/leanimt-rs

The benchmark can be executed in both a Node.js server and a browser environment.

## Steps to generate the code

1. Add Poseidon function to the Rust implementation.

2. Generate wasm files from the Rust code.

3. Generate benchmarks in Node.js.

4. Generate benchmarks in the browser.

## Running the benchmarks to generate the results

### Server

The first step is to generate the wasm from the Rust code using the following command inside the `/imt-poseidon-rs` folder:

`wasm-pack build --target nodejs`

A `pkg` folder will be generated with all the necessary code.

Then, inside the `imt-node-benchmarks` folder, after installing the dependencies with ``:

`yarn ts-node src/main.ts`

a table with the results will be printed in the console.

All these steps can be done in one step by running `npm run node` from the root folder.

### Browser

We are going to run a local server so the benchmark can be run in the browser.

The first step is to compile the Rust code with the correct target:

`wasm-pack build --target web`

Then, copy the contents of the generated `/pkg` folder into `/imt-browser-benchmarks/src/assets/wasm/`. This can be done with the following command:

`cp -r ./pkg ../imt-browser-benchmarks/src/assets/wasm/`

After installing the dependencies with ``, the local server can be started using:

`npm run dev`

Again, all these steps can be run with one command using `npm run browser`.

## Future work

- [ ] Compare the `InsertMany` function, which still needs to be implemented in Rust.

- [X] Improve the web app to display results so it's not necessary to run them locally.

- [X] Deploy the web app.
