
def check_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                stack.append(i + 1)
            elif char == '}':
                if not stack:
                    print(f"Extra closing brace at line {i + 1}")
                else:
                    stack.pop()
    
    if stack:
        print(f"Unclosed braces starting at lines: {stack}")
    else:
        print("Braces are balanced!")

import sys
if len(sys.argv) > 1:
    check_braces(sys.argv[1])
