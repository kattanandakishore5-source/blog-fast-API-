import os

def create_claude_prompt():
    output_file = "claude_code.txt"
    ignore_dirs = {'__pycache__', 'venv', '.git', '.vscode'}
    ignore_exts = {'.db', '.pyc', '.png', '.txt', '.gitignore'}

    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("Here is my current FastAPI project. Please analyze the structure and code:\n\n")
        
        for root, dirs, files in os.walk('.'):
            # Mutate dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if any(file.endswith(ext) for ext in ignore_exts) or file == 'bundle.py':
                    continue
                
                file_path = os.path.join(root, file).replace('\\', '/')
                
                out.write(f"<file path=\"{file_path}\">\n")
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        out.write(f.read())
                except Exception as e:
                    out.write(f"# Could not read file: {e}")
                out.write("\n</file>\n\n")

if __name__ == "__main__":
    create_claude_prompt()
    print("Done! Open claude_code.txt")