use light_poseidon::{ Poseidon, PoseidonHasher };
use ark_bn254::Fr;
use ark_ff::PrimeField;

pub fn hash_function(nodes: Vec<String>) -> String {
    let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();

    let input1 = Fr::from_be_bytes_mod_order(nodes[0].as_bytes());
    let input2 = Fr::from_be_bytes_mod_order(nodes[1].as_bytes());

    let hash = poseidon.hash(&[input1, input2]).unwrap();

    return hash.to_string();
}