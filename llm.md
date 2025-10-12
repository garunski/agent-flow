# The Technical Reality of How LLMs Work

## Tokenization

**Byte-Pair Encoding (BPE)** or similar algorithms break text into subword units. The tokenizer maintains a vocabulary (typically 50k-100k tokens) learned by iteratively merging the most frequent character or character sequence pairs in the training corpus.

Each token gets mapped to an integer ID. "Hello world" might become `[15496, 995]`.

## Embedding Layer

Each token ID is mapped to a dense vector (typically 768-12,288 dimensions depending on model size). This is a learned lookup table - just a giant matrix where row `i` corresponds to token `i`'s embedding vector.

These embeddings are **not** predetermined semantic representations - they're randomly initialized and learned to minimize loss during training.

## Transformer Architecture

**Self-Attention Mechanism:**

For each token position, we compute:
- **Query (Q)**: `Q = X · W_Q`
- **Key (K)**: `K = X · W_K`  
- **Value (V)**: `V = X · W_V`

Where X is the input embedding matrix and W are learned weight matrices.

Attention scores: `Attention(Q,K,V) = softmax(QK^T / √d_k) · V`

This produces a weighted sum of value vectors, where weights come from the compatibility (dot product) between queries and keys.

**Multi-Head Attention:** Run this process in parallel with different W matrices (8-96 heads), then concatenate and project.

**Feed-Forward Networks:** After attention, each position passes through:
`FFN(x) = max(0, xW_1 + b_1)W_2 + b_2`

This is a two-layer MLP with ReLU or GELU activation, typically expanding to 4x the model dimension then projecting back.

**Layer Norm & Residual Connections:** Each sublayer has `LayerNorm(x + Sublayer(x))` to stabilize training.

Stack this 12-96+ times depending on model size.

## Pre-training: Next Token Prediction

**Objective:** Maximize `p(x_t | x_1, ..., x_{t-1})` across the entire training corpus.

**Loss:** Cross-entropy between predicted probability distribution and actual next token:
`L = -Σ log p(x_t | x_<t)`

**Optimization:** Adam or AdamW optimizer with:
- Learning rate: ~1e-4 with warmup then cosine decay
- Batch size: Millions of tokens per batch (across thousands of GPUs)
- Gradient clipping to prevent explodes

**Backpropagation:** Compute gradients ∂L/∂W for all weight matrices and update:
`W_new = W_old - η · ∇L`

This happens for trillions of tokens over weeks/months on massive GPU clusters.

## The Weight Matrices

After training, the model is just **hundreds of billions of floating-point numbers** organized into weight matrices. There's no database, no symbolic knowledge - just learned linear transformations.

When you see parameters like "175B parameters" (GPT-3) or "70B parameters" (Llama-2), these are literally the count of individual float32/float16 values in all the weight matrices.

## Inference: Autoregressive Generation

1. Encode prompt into token IDs
2. Convert to embeddings and add positional encodings
3. Forward pass through all transformer layers
4. Final linear layer projects to vocabulary size: `logits = hidden_state · W_output`
5. Apply softmax: `p(token) = exp(logit_i) / Σ exp(logit_j)`
6. Sample from this distribution (with temperature, top-k, top-p)
7. Append sampled token to sequence
8. **Repeat from step 2** with new sequence

Each token is generated one at a time, conditioned on all previous tokens. This is why generation can be slow.

## Reinforcement Learning from Human Feedback (RLHF)

**Phase 1 - Supervised Fine-Tuning (SFT):**
Train on human-written demonstrations of desired behavior using standard supervised learning.

**Phase 2 - Reward Model Training:**
Collect human preferences: given outputs A and B for the same prompt, humans choose which is better.

Train a reward model (another transformer) to predict human preferences:
`r(x, y) = scalar reward score`

**Phase 3 - PPO (Proximal Policy Optimization):**
Use the reward model as a signal to fine-tune the LLM with RL.

Objective: `maximize E[r(x,y)] - β·KL(π_θ || π_ref)`

Where:
- `π_θ` is the policy being optimized (the LLM)
- `π_ref` is the reference model (SFT model)
- KL divergence term prevents the model from deviating too far from the reference

This uses policy gradient methods to adjust weights to maximize expected reward while staying close to the original model.

## Key Technical Details

**Memory/Computation:** Attention is O(n²) in sequence length because every token attends to every other token. This is why context windows are limited.

**Positional Encoding:** Since transformers have no inherent notion of order, position information is added (sinusoidal encoding, learned embeddings, or RoPE/ALiBi).

**KV Cache:** During inference, previously computed key/value vectors are cached to avoid recomputing attention for earlier tokens.

**Distributed Training:** Models are split across GPUs using:
- Data parallelism (different batches)
- Model parallelism (different layers)
- Tensor parallelism (split individual matrices)
- Pipeline parallelism (layer groups on different devices)

The "magic" is just gradient descent finding weight values that minimize prediction loss across astronomical amounts of text data.


# The Role of Context in LLMs

Context is **everything the model can see when generating the next token**. It's not a vague concept - it's the literal sequence of tokens in the current forward pass.

## Technical Definition

Context = the input sequence `[x_1, x_2, ..., x_t]` that the model processes to predict `x_{t+1}`

The **context window** or **context length** is the maximum number of tokens the model can process at once (e.g., 4k, 8k, 32k, 128k tokens depending on the model).

## Why Context Matters: Attention Mechanism

In the self-attention computation:

```
Attention(Q,K,V) = softmax(QK^T / √d_k) · V
```

When generating token at position `t`:
- **Query** at position `t` compares against
- **Keys** from ALL previous positions `[1, 2, ..., t]`
- The resulting attention weights determine which previous tokens influence the current prediction

**This is how the model "remembers" earlier parts of the conversation.** It's not accessing a memory store - it's recomputing attention weights over the visible token sequence every single time.

## Causal Masking

LLMs use **causal attention** (autoregressive constraint):

Position `t` can only attend to positions `≤ t`, never future positions.

This is implemented via an attention mask that sets future positions to `-∞` before softmax, making their attention weights zero:

```
[   0,  -∞,  -∞,  -∞ ]
[   0,    0,  -∞,  -∞ ]
[   0,    0,    0,  -∞ ]
[   0,    0,    0,    0 ]
```

This enforces that prediction only depends on past context.

## Context Window Limitations

**Hard Constraint:** If your context exceeds the maximum length (say 8,192 tokens), the model literally cannot process it. Common strategies:

1. **Truncation:** Drop the oldest tokens (the model "forgets" the beginning)
2. **Sliding window:** Keep most recent N tokens
3. **Summarization:** Compress old context before processing

**Computational Cost:** Attention is O(n²) in sequence length:
- 1k tokens: ~1M attention computations
- 8k tokens: ~64M attention computations  
- 128k tokens: ~16B attention computations per layer

Longer context = quadratically more expensive.

## Positional Information

Without positional encoding, transformers can't distinguish token order - `"dog bites man"` would be identical to `"man bites dog"`.

**Absolute Positional Encoding (original transformers):**
Add position-specific vectors to embeddings:
```
PE(pos, 2i) = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
```

**Relative Position Methods (modern LLMs):**
- **RoPE (Rotary Position Embedding):** Rotates query/key vectors based on relative position
- **ALiBi:** Adds position-based bias directly to attention scores

These help the model understand "this word came 5 tokens after that word."

## Context in Multi-Turn Conversations

Each message in a conversation is concatenated into one long sequence:

```
[System prompt tokens] [User message 1] [Assistant response 1] 
[User message 2] [Assistant response 2] [User message 3]
```

When generating the next token, the model sees **all of this** up to its context limit.

**This is why:**
- I can reference earlier parts of our conversation
- Token count accumulates (context fills up over time)
- Very long conversations eventually lose the beginning

## What Context Does NOT Do

❌ **Not a database:** The model doesn't "store" or "retrieve" information from context. It processes it through fixed transformations.

❌ **Not perfect memory:** Attention can be diffuse. Information from 50k tokens ago in a 128k context might have minimal impact on current predictions.

❌ **Not understanding:** Context influences the probability distribution over next tokens, but the model is still doing statistical pattern matching, not semantic reasoning.

## Context vs. Training Data

**Training data:** Compressed into weight matrices during training. This is the model's "knowledge."

**Context:** Dynamic input that modulates how those weights are applied for this specific inference pass.

Example:
- Training data tells the model what Python syntax looks like
- Context (your specific code) tells it what to generate next in YOUR program

## Advanced: KV Cache

During generation, we cache the Key and Value matrices for all previous tokens:

```
Step 1: Compute K₁, V₁ for token 1
Step 2: Compute K₂, V₂ for token 2, keep K₁, V₁
Step 3: Compute K₃, V₃ for token 3, keep K₁, K₂, V₁, V₂
...
```

This avoids recomputing attention for tokens that haven't changed. Memory usage: O(n · layers · hidden_dim) for sequence length n.

## Recent Extensions: Long Context

Models like GPT-4, Claude, or Gemini with 100k+ token windows use:
- **Sparse attention patterns** (not every token attends to every other)
- **Memory-efficient attention** implementations (Flash Attention)
- **Better positional encodings** that extrapolate beyond training lengths

But fundamentally, context is still just the visible token sequence being processed through the attention mechanism.

**Bottom line:** Context is the input token sequence that determines attention patterns, which determine the probability distribution for the next token. That's it. No magic.
