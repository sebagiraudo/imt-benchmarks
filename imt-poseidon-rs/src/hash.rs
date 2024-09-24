use light_poseidon::{ Poseidon, PoseidonHasher };
use ark_bn254::Fr;
use num_bigint::BigUint;

fn string_to_biguint(num_str: &str) -> BigUint {
    num_str
        .parse()
        .expect("Failed to parse the string into BigUint")
}

pub fn hash_function(nodes: Vec<String>) -> String {
    let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();

    let input1 = Fr::from(string_to_biguint(&nodes[0]));
    let input2 = Fr::from(string_to_biguint(&nodes[1]));

    let hash = poseidon.hash(&[input1, input2]).unwrap();

    hash.to_string()
}