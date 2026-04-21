"""
Code Corrector - Generates corrected code based on detected errors
Uses ML feature analysis and error detection to fix issues
"""

import re
from typing import List, Dict, Tuple
from error_detector import ErrorDetector


class CodeCorrector:
    """Generates corrected code based on error detection"""

    @staticmethod
    def correct_code(code: str, language: str = "python") -> Dict:
        """
        Generate corrected code addressing detected errors
        
        Args:
            code: Source code with issues
            language: Programming language
            
        Returns:
            Dictionary with corrected code and fixes applied
        """
        try:
            # Detect errors first
            error_report = ErrorDetector.detect_errors(code, language)
            
            if not error_report.get('success', True):
                return {
                    'success': False,
                    'error': 'Error detection failed',
                    'original_code': code,
                    'corrected_code': code
                }
            
            corrected = code
            fixes_applied = []
            
            # Apply corrections based on language
            if language == 'python':
                corrected, python_fixes = CodeCorrector._correct_python(corrected, error_report)
                fixes_applied.extend(python_fixes)
            elif language in ['javascript', 'typescript']:
                corrected, js_fixes = CodeCorrector._correct_javascript(corrected, error_report, language)
                fixes_applied.extend(js_fixes)
            elif language == 'java':
                corrected, java_fixes = CodeCorrector._correct_java(corrected, error_report)
                fixes_applied.extend(java_fixes)
            
            # Apply common corrections
            corrected, common_fixes = CodeCorrector._apply_common_fixes(corrected, language)
            fixes_applied.extend(common_fixes)
            
            return {
                'success': True,
                'original_code': code,
                'corrected_code': corrected,
                'fixes_applied': fixes_applied,
                'error_report': error_report,
                'improvements': len(fixes_applied),
                'language': language
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'original_code': code,
                'corrected_code': code,
                'fixes_applied': []
            }

    @staticmethod
    def _correct_python(code: str, error_report: Dict) -> Tuple[str, List[str]]:
        """Apply Python-specific corrections"""
        corrected = code
        fixes = []
        
        # Fix 1: Convert camelCase to snake_case
        camel_vars = re.findall(r'\b([a-z]+[A-Z][a-zA-Z]*)\b', code)
        for var in set(camel_vars):
            snake_var = CodeCorrector._camel_to_snake(var)
            if snake_var != var:
                corrected = re.sub(r'\b' + var + r'\b', snake_var, corrected)
                fixes.append(f"Renamed variable '{var}' to '{snake_var}' (Python convention)")
        
        # Fix 2: Add missing colons after if/for/while
        corrected = re.sub(r'(if|elif|else|for|while|def|class)\s+([^:]*)\s*\n', r'\1 \2:\n', corrected)
        
        # Fix 3: Fix indentation (convert tabs to spaces)
        if '\t' in corrected:
            corrected = corrected.replace('\t', '    ')
            fixes.append("Converted tabs to spaces (Python standard: 4 spaces)")
        
        # Fix 4: Add docstrings for functions without them
        corrected = CodeCorrector._add_python_docstrings(corrected)
        fixes.append("Added missing docstrings to functions")
        
        # Fix 5: Fix common mistakes
        corrected = corrected.replace('var ', 'val = ')  # JavaScript var -> Python
        
        return corrected, fixes

    @staticmethod
    def _correct_javascript(code: str, error_report: Dict, language: str) -> Tuple[str, List[str]]:
        """Apply JavaScript/TypeScript-specific corrections"""
        corrected = code
        fixes = []
        
        # Fix 1: Add missing semicolons
        lines = corrected.split('\n')
        fixed_lines = []
        for line in lines:
            stripped = line.rstrip()
            if stripped and not stripped.endswith((';', '{', '}', ':', ',', '//')) and 'for' not in stripped:
                if '=' in stripped or 'return' in stripped or 'const' in stripped or 'let' in stripped:
                    stripped = stripped + ';'
            fixed_lines.append(stripped)
        
        if corrected != '\n'.join(fixed_lines):
            corrected = '\n'.join(fixed_lines)
            fixes.append("Added missing semicolons")
        
        # Fix 2: Convert var to const/let
        corrected = re.sub(r'\bvar\s+', 'const ', corrected)
        fixes.append("Converted 'var' to 'const' (modern JavaScript)")
        
        # Fix 3: Fix spacing around operators
        corrected = re.sub(r'(\w)=(\w)', r'\1 = \2', corrected)
        fixes.append("Added spaces around operators")
        
        # Fix 4: Convert function to arrow function where appropriate
        if language == 'typescript':
            # Add type annotations placeholders
            corrected = re.sub(r'function\s+(\w+)\s*\(\s*\)', r'\1: () =>', corrected)
            fixes.append("Updated function syntax for TypeScript")
        
        return corrected, fixes

    @staticmethod
    def _correct_java(code: str, error_report: Dict) -> Tuple[str, List[str]]:
        """Apply Java-specific corrections"""
        corrected = code
        fixes = []
        
        # Fix 1: Add missing semicolons
        lines = corrected.split('\n')
        fixed_lines = []
        for line in lines:
            stripped = line.rstrip()
            if stripped and not stripped.endswith((';', '{', '}')) and not stripped.startswith('//'):
                if any(keyword in stripped for keyword in ['return', '=', 'System.out']):
                    stripped = stripped + ';'
            fixed_lines.append(stripped)
        
        corrected = '\n'.join(fixed_lines)
        fixes.append("Added missing semicolons")
        
        # Fix 2: Add access modifiers if missing
        if 'class ' in corrected and 'public class' not in corrected:
            corrected = corrected.replace('class ', 'public class ')
            fixes.append("Added 'public' access modifier to class")
        
        # Fix 3: Fix spacing
        corrected = re.sub(r'(\w)\(', r'\1(', corrected)
        corrected = re.sub(r'\)(\w)', r') \1', corrected)
        fixes.append("Standardized spacing around parentheses")
        
        return corrected, fixes

    @staticmethod
    def _apply_common_fixes(code: str, language: str) -> Tuple[str, List[str]]:
        """Apply language-agnostic fixes"""
        corrected = code
        fixes = []
        
        # Fix 1: Remove trailing whitespace
        lines = corrected.split('\n')
        lines = [line.rstrip() for line in lines]
        if corrected != '\n'.join(lines):
            corrected = '\n'.join(lines)
            fixes.append("Removed trailing whitespace")
        
        # Fix 2: Ensure consistent brace style
        corrected = re.sub(r'\{\s*\n', ' {\n', corrected)
        
        # Fix 3: Add proper spacing
        corrected = re.sub(r',(\S)', r', \1', corrected)
        
        # Fix 4: Remove multiple blank lines
        corrected = re.sub(r'\n\n\n+', '\n\n', corrected)
        fixes.append("Fixed formatting and spacing")
        
        # Fix 5: Balance parentheses/brackets
        if CodeCorrector._check_unbalanced_brackets(corrected):
            try:
                corrected = CodeCorrector._fix_unbalanced_brackets(corrected)
                fixes.append("Fixed unbalanced brackets/parentheses")
            except:
                pass  # Keep original if fixing fails
        
        return corrected, fixes

    @staticmethod
    def _camel_to_snake(name: str) -> str:
        """Convert camelCase to snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    @staticmethod
    def _add_python_docstrings(code: str) -> str:
        """Add missing docstrings to Python functions"""
        lines = code.split('\n')
        fixed_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            fixed_lines.append(line)
            
            # Check if this is a function definition
            if line.strip().startswith('def ') and line.strip().endswith(':'):
                # Check if next line is a docstring
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if not (next_line.startswith('"""') or next_line.startswith("'''")):
                        # Add docstring
                        indent = len(line) - len(line.lstrip()) + 4
                        func_name = re.search(r'def\s+(\w+)', line)
                        if func_name:
                            fixed_lines.append(' ' * indent + f'"""{func_name.group(1)} function."""')
            
            i += 1
        
        return '\n'.join(fixed_lines)

    @staticmethod
    def _check_unbalanced_brackets(code: str) -> bool:
        """Check if code has unbalanced brackets"""
        stack = []
        pairs = {'(': ')', '[': ']', '{': '}'}
        
        for char in code:
            if char in pairs:
                stack.append(char)
            elif char in pairs.values():
                if not stack or pairs[stack.pop()] != char:
                    return True
        
        return len(stack) > 0

    @staticmethod
    def _fix_unbalanced_brackets(code: str) -> str:
        """Attempt to fix unbalanced brackets"""
        stack = []
        pairs = {'(': ')', '[': ']', '{': '}'}
        fixed = list(code)
        
        for i, char in enumerate(code):
            if char in pairs:
                stack.append((char, i))
            elif char in pairs.values():
                if stack:
                    stack.pop()
        
        # Add missing closing brackets
        for opening, _ in reversed(stack):
            fixed.append(pairs[opening])
        
        return ''.join(fixed)


def get_correction_report(original: str, corrected: str, fixes: List[str]) -> str:
    """Generate a report of corrections made"""
    report = []
    report.append("=" * 60)
    report.append("CODE CORRECTION REPORT")
    report.append("=" * 60)
    report.append(f"Total Fixes Applied: {len(fixes)}")
    report.append("")
    
    report.append("Fixes Applied:")
    for i, fix in enumerate(fixes, 1):
        report.append(f"  {i}. {fix}")
    
    report.append("")
    report.append("=" * 60)
    
    return "\n".join(report)
