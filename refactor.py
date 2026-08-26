import os
import re

files_to_refactor = [
    "/home/manisha/Documents/legal-app/src/app/shared/components/error-state/error-state.component.ts",
    "/home/manisha/Documents/legal-app/src/app/shared/components/avatar/avatar.component.ts",
    "/home/manisha/Documents/legal-app/src/app/shared/components/stat-card/stat-card.component.ts",
    "/home/manisha/Documents/legal-app/src/app/shared/components/skeleton-loader/skeleton-loader.component.ts",
    "/home/manisha/Documents/legal-app/src/app/shared/components/empty-state/empty-state.component.ts",
    "/home/manisha/Documents/legal-app/src/app/shared/components/bottom-nav/bottom-nav.component.ts",
    "/home/manisha/Documents/legal-app/src/app/features/client/messages/client-messages.page.ts",
    "/home/manisha/Documents/legal-app/src/app/features/client/cases/client-cases.page.ts",
    "/home/manisha/Documents/legal-app/src/app/features/advocate/messages/advocate-messages.page.ts",
    "/home/manisha/Documents/legal-app/src/app/features/advocate/cases/advocate-cases.page.ts",
    "/home/manisha/Documents/legal-app/src/app/features/advocate/opinions/advocate-opinions.page.ts",
    "/home/manisha/Documents/legal-app/src/app/layouts/client-layout/client-layout.component.ts",
    "/home/manisha/Documents/legal-app/src/app/layouts/advocate-layout/advocate-layout.component.ts",
    "/home/manisha/Documents/legal-app/src/app/layouts/auth-layout/auth-layout.component.ts"
]

def extract_content(text, start_pattern, end_char='`'):
    match = re.search(start_pattern, text)
    if not match:
        return None, None
    
    start_idx = match.end()
    
    # Simple parsing to find matching backtick, handling escapes is usually needed but we have simple strings here
    # Actually, we can just use re to find the next backtick that isn't escaped, but our backticks are simple.
    
    # A better way is using a robust regex for backtick string:
    # `([^`\\]*(?:\\.[^`\\]*)*)`
    bt_match = re.search(r'`([^`\\]*(?:\\.[^`\\]*)*)`', text[start_idx-1:])
    if not bt_match:
        return None, None
        
    extracted_text = bt_match.group(1)
    full_match_start = match.start()
    full_match_end = start_idx - 1 + bt_match.end()
    
    return extracted_text.strip(), (full_match_start, full_match_end)

for file_path in files_to_refactor:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    base_name = os.path.splitext(file_path)[0]
    html_path = base_name + '.html'
    scss_path = base_name + '.scss'
    
    file_name = os.path.basename(base_name)
    
    template_content, template_range = extract_content(content, r'template:\s*')
    
    styles_content = None
    styles_range = None
    
    # styles could be styles: [`...`]
    styles_match = re.search(r'styles:\s*\[\s*`', content)
    if styles_match:
        # extract the backtick string
        start_idx = styles_match.end()
        bt_match = re.search(r'([^`\\]*(?:\\.[^`\\]*)*)`', content[start_idx:])
        if bt_match:
            styles_content = bt_match.group(1).strip()
            # Also we need to swallow the closing ]
            # Let's find the closing ] after the backtick
            end_idx = start_idx + bt_match.end()
            bracket_match = re.search(r'\s*\]', content[end_idx:])
            if bracket_match:
                styles_range = (styles_match.start(), end_idx + bracket_match.end())
            else:
                styles_range = (styles_match.start(), end_idx)
    
    new_content = content
    modified = False
    
    if template_content is not None:
        with open(html_path, 'w') as f:
            f.write(template_content + '\n')
            
        new_content = new_content[:template_range[0]] + f"templateUrl: './{file_name}.html'" + new_content[template_range[1]:]
        modified = True
        
    if styles_content is not None:
        with open(scss_path, 'w') as f:
            f.write(styles_content + '\n')
            
        # Re-find the styles range in the new_content, because template replacement might have shifted indices
        # Let's just do a string replace for the style part
        # Actually it's easier to just use re.sub or recalculate
        styles_match = re.search(r'styles:\s*\[\s*`([^`\\]*(?:\\.[^`\\]*)*)`\s*\]', new_content)
        if styles_match:
            new_content = new_content[:styles_match.start()] + f"styleUrl: './{file_name}.scss'" + new_content[styles_match.end():]
            modified = True
            
    if modified:
        with open(file_path, 'w') as f:
            f.write(new_content)
            
    print(f"Refactored {file_path}")
