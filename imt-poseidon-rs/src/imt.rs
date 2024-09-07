use wasm_bindgen::prelude::*;
use crate::hash::hash_function;


#[wasm_bindgen]
pub struct IMT {
    nodes: Vec<Vec<IMTNode>>,
    zeroes: Vec<IMTNode>,
    depth: usize,
    arity: usize,
}

#[wasm_bindgen]
pub struct IMTMerkleProof {
    root: IMTNode,
    leaf: IMTNode,
    path_indices: Vec<usize>,
    siblings: Vec<Vec<IMTNode>>,
}

pub type IMTNode = String;
// pub type IMTHashFunction = fn(Vec<IMTNode>) -> IMTNode;

#[wasm_bindgen]
impl IMT {
    #[wasm_bindgen(constructor)]
    pub fn new(
        depth: usize,
        zero_value: IMTNode,
        arity: usize,
        leaves: Vec<IMTNode>,
    ) -> Result<IMT, JsValue> {
        if leaves.len() > arity.pow(depth as u32) {
            return Err(JsValue::from_str("The tree cannot contain more than arity^depth leaves"));
        }
        let mut imt = IMT {
            nodes: vec![vec![]; depth + 1],
            zeroes: vec![],
            depth,
            arity,
        };

        let mut current_zero = zero_value;
        for _ in 0..depth {
            imt.zeroes.push(current_zero.clone());
            current_zero = (hash_function)(vec![current_zero; arity]);
        }

        imt.nodes[0] = leaves;

        for level in 0..depth {
            for index in 0..((imt.nodes[level].len() as f64 / arity as f64).ceil() as usize) {
                let position = index * arity;
                let children: Vec<_> = (0..arity)
                    .map(|i| {
                        imt.nodes[level]
                            .get(position + i)
                            .cloned()
                            .unwrap_or_else(|| imt.zeroes[level].clone())
                    })
                    .collect();

                if let Some(next_level) = imt.nodes.get_mut(level + 1) {
                    next_level.push((hash_function)(children));
                }
            }
        }

        Ok(imt)
    }

    #[wasm_bindgen]
    pub fn root(&mut self) -> Option<IMTNode> {
        self.nodes[self.depth].first().cloned()
    }

    #[wasm_bindgen]
    pub fn depth(&self) -> usize {
        self.depth
    }

    #[wasm_bindgen]
    pub fn leaves(&self) -> Vec<IMTNode> {
        self.nodes[0].clone()
    }

    #[wasm_bindgen]
    pub fn arity(&self) -> usize {
        self.arity
    }

    #[wasm_bindgen]
    pub fn insert(&mut self, leaf: IMTNode) -> Result<(), JsValue> {
        if self.nodes[0].len() >= self.arity.pow(self.depth as u32) {
            return Err(JsValue::from_str("The tree is full"));

        }

        let index = self.nodes[0].len();
        self.nodes[0].push(leaf);
        self.update(index, self.nodes[0][index].clone())
    }

    #[wasm_bindgen]
    pub fn update(&mut self, mut index: usize, new_leaf: IMTNode) -> Result<(), JsValue> {
        if index >= self.nodes[0].len() {
            return Err(JsValue::from_str("The leaf does not exist in this tree"));
        }

        let mut node = new_leaf;
        self.nodes[0][index].clone_from(&node);

        for level in 0..self.depth {
            let position = index % self.arity;
            let level_start_index = index - position;
            let level_end_index = level_start_index + self.arity;

            let children: Vec<_> = (level_start_index..level_end_index)
                .map(|i| {
                    self.nodes[level]
                        .get(i)
                        .cloned()
                        .unwrap_or_else(|| self.zeroes[level].clone())
                })
                .collect();

            node = (hash_function)(children);
            index /= self.arity;

            if self.nodes[level + 1].len() <= index {
                self.nodes[level + 1].push(node.clone());
            } else {
                self.nodes[level + 1][index].clone_from(&node);
            }
        }

        Ok(())
    }

    #[wasm_bindgen]
    pub fn delete(&mut self, index: usize) -> Result<(), JsValue> {
        self.update(index, self.zeroes[0].clone())
    }

    #[wasm_bindgen]
    pub fn create_proof(&self, index: usize) -> Result<IMTMerkleProof, JsValue> {
        if index >= self.nodes[0].len() {
            return Err(JsValue::from_str("The leaf does not exist in this tree"));
        }

        let mut siblings = Vec::with_capacity(self.depth);
        let mut path_indices = Vec::with_capacity(self.depth);
        let mut current_index = index;

        for level in 0..self.depth {
            let position = current_index % self.arity;
            let level_start_index = current_index - position;
            let level_end_index = level_start_index + self.arity;

            path_indices.push(position);
            let mut level_siblings = Vec::new();

            for i in level_start_index..level_end_index {
                if i != current_index {
                    level_siblings.push(
                        self.nodes[level]
                            .get(i)
                            .cloned()
                            .unwrap_or_else(|| self.zeroes[level].clone()),
                    );
                }
            }

            siblings.push(level_siblings);
            current_index /= self.arity;
        }

        Ok(IMTMerkleProof {
            root: self.nodes[self.depth][0].clone(),
            leaf: self.nodes[0][index].clone(),
            path_indices,
            siblings,
        })
    }

    #[wasm_bindgen]
    pub fn verify_proof(&self, proof: &IMTMerkleProof) -> bool {
        let mut node = proof.leaf.clone();

        for (i, sibling) in proof.siblings.iter().enumerate() {
            let mut children = sibling.clone();
            children.insert(proof.path_indices[i], node);

            node = (hash_function)(children);
        }

        node == proof.root
    }
}

