from transformers import AutoTokenizer, Gemma3nForConditionalGeneration
import torch

model_id = "./my_modified_gemma_3n_model"

# Carregando modelo e tokenizer
model = Gemma3nForConditionalGeneration.from_pretrained(
    model_id,
    device_map="auto",
    # torch_dtype=torch.bfloat16,
    load_in_8bit=True,  # Carregando em 8 bits
).eval()

tokenizer = AutoTokenizer.from_pretrained(model_id)

# Construindo manualmente o chat template
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Tell me a joke about cats."}
]

chat_prompt = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=False  # Aqui queremos o texto para visualizar o prompt
)

# Tokenizando o prompt manualmente
inputs = tokenizer(
    chat_prompt,
    return_tensors="pt"
).to(model.device)  # Certifique-se de que os tensores estão no dispositivo correto

input_len = inputs["input_ids"].shape[-1]


with torch.inference_mode():
    generation = model.generate(
        **inputs,
        max_new_tokens=100,
        do_sample=False
    )
    generation = generation[0][input_len:]

# Decodificando
decoded = tokenizer.decode(generation, skip_special_tokens=True)
print(decoded)
