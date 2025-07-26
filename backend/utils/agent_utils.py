def load_prompt(prompt_file, deps):
    with open(prompt_file, "r", encoding="utf-8") as f:
        prompt_template = f.read()
    return prompt_template.format(**deps)