"""
Error Detector - ML-based error detection using code features
Identifies specific errors and issues in code based on features analysis
"""

import re
from typing import List, Dict, Any
from feature_extractor import CodeFeatureExtractor


class ErrorDetector:
    """Detects errors in code using ML features"""

    @staticmethod
    def detect_errors(code: str, language: str = "python") -> Dict[str, Any]:
        """
        Detect errors using ML feature analysis
        
        Args:
            code: Source code
            language: Programming language
            
        Returns:
            Dictionary with detected errors and recommendations
        """
        errors = []
        warnings = []
        features = CodeFeatureExtractor.extract_features(code)
        
        # Error Detection Logic based on Features
        
        # 1. High Complexity Detection
        if features.get('cyclomatic_complexity', 0) > 15:
            errors.append({
                'type': 'COMPLEXITY',
                'severity': 'HIGH',
                'message': 'Code has high cyclomatic complexity',
                'suggestion': 'Refactor into smaller functions',
                'priority': 1,
                'feature': 'cyclomatic_complexity',
                'value': features.get('cyclomatic_complexity', 0)
            })
        elif features.get('cyclomatic_complexity', 0) > 10:
            warnings.append({
                'type': 'COMPLEXITY',
                'severity': 'MEDIUM',
                'message': 'Code complexity is moderate',
                'suggestion': 'Consider breaking into smaller functions',
                'priority': 2
            })
        
        # 2. Deep Nesting Detection
        if features.get('max_nesting_depth', 0) > 4:
            errors.append({
                'type': 'NESTING',
                'severity': 'HIGH',
                'message': f"Deep nesting depth: {int(features.get('max_nesting_depth', 0))} levels",
                'suggestion': 'Reduce nesting depth by extracting methods',
                'priority': 1,
                'feature': 'max_nesting_depth',
                'value': features.get('max_nesting_depth', 0)
            })
        
        # 3. Large Function Detection
        if features.get('avg_function_length', 0) > 30:
            errors.append({
                'type': 'SIZE',
                'severity': 'MEDIUM',
                'message': 'Functions are too large',
                'suggestion': 'Split large functions into smaller units',
                'priority': 2,
                'feature': 'avg_function_length',
                'value': features.get('avg_function_length', 0)
            })
        
        # 4. Poor Documentation Detection
        if features.get('comment_ratio', 0) < 0.05 and features.get('num_lines', 0) > 10:
            warnings.append({
                'type': 'DOCUMENTATION',
                'severity': 'MEDIUM',
                'message': 'Insufficient comments/documentation',
                'suggestion': 'Add comments explaining complex logic',
                'priority': 3
            })
        
        # 5. Missing Error Handling
        if not features.get('has_error_handling', False) and features.get('num_functions', 0) > 0:
            warnings.append({
                'type': 'ERROR_HANDLING',
                'severity': 'HIGH',
                'message': 'No error handling found',
                'suggestion': 'Add try-catch or error handling blocks',
                'priority': 1
            })
        
        # 6. Type Safety Issues
        if not features.get('has_type_hints', False) and language in ['python', 'typescript', 'java']:
            warnings.append({
                'type': 'TYPE_SAFETY',
                'severity': 'MEDIUM',
                'message': 'Missing type hints/annotations',
                'suggestion': f'Add type hints for better code safety',
                'priority': 2
            })
        
        # 7. Unused Variables Detection
        unused_count = features.get('num_unused_vars', 0)
        if unused_count > 0:
            warnings.append({
                'type': 'UNUSED_VARS',
                'severity': 'LOW',
                'message': f'Possible unused variables detected: {int(unused_count)}',
                'suggestion': 'Remove or use all declared variables',
                'priority': 4
            })
        
        # 8. Code Duplication Patterns
        code_lines = code.split('\n')
        if ErrorDetector._has_duplication(code_lines):
            warnings.append({
                'type': 'DUPLICATION',
                'severity': 'MEDIUM',
                'message': 'Potential code duplication detected',
                'suggestion': 'Extract duplicated code into reusable functions',
                'priority': 2
            })
        
        # 9. Naming Convention Issues
        naming_issues = ErrorDetector._check_naming_conventions(code, language)
        if naming_issues:
            warnings.extend(naming_issues)
        
        # 10. Performance Issues
        perf_issues = ErrorDetector._check_performance_issues(code, language)
        if perf_issues:
            warnings.extend(perf_issues)
        
        return {
            'success': True,
            'errors': sorted(errors, key=lambda x: x.get('priority', 999)),
            'warnings': sorted(warnings, key=lambda x: x.get('priority', 999)),
            'total_errors': len(errors),
            'total_warnings': len(warnings),
            'error_score': max(0, 100 - (len(errors) * 10 + len(warnings) * 5)),
            'error_density': (len(errors) + len(warnings)) / max(len(code_lines), 1),
            'features': features
        }

    @staticmethod
    def _has_duplication(lines: List[str], min_length: int = 5) -> bool:
        """Check for code duplication patterns"""
        # Simple heuristic: look for repeated line patterns
        line_patterns = {}
        for line in lines:
            stripped = line.strip()
            if len(stripped) > min_length:
                pattern = ' '.join(stripped.split()[:3])  # First 3 words
                line_patterns[pattern] = line_patterns.get(pattern, 0) + 1
        
        # If any pattern appears more than once, we have duplication
        return any(count > 2 for count in line_patterns.values())

    @staticmethod
    def _check_naming_conventions(code: str, language: str) -> List[Dict]:
        """Check for naming convention violations"""
        issues = []
        
        if language == 'python':
            # Check for camelCase variables (should be snake_case)
            camel_case_vars = re.findall(r'\b[a-z]+[A-Z][a-zA-Z]*\b', code)
            if camel_case_vars:
                issues.append({
                    'type': 'NAMING',
                    'severity': 'LOW',
                    'message': 'Python variables use camelCase instead of snake_case',
                    'suggestion': 'Use snake_case for Python variables',
                    'priority': 5,
                    'examples': list(set(camel_case_vars[:3]))
                })
        
        elif language in ['javascript', 'typescript']:
            # Check for snake_case (should be camelCase)
            snake_case_vars = re.findall(r'\b[a-z]+_[a-z_]+\b', code)
            if snake_case_vars:
                # Exclude common constants
                if not all(v.isupper() for v in snake_case_vars):
                    issues.append({
                        'type': 'NAMING',
                        'severity': 'LOW',
                        'message': 'Variables use snake_case instead of camelCase',
                        'suggestion': 'Use camelCase for JavaScript/TypeScript variables',
                        'priority': 5,
                        'examples': list(set(snake_case_vars[:3]))
                    })
        
        return issues

    @staticmethod
    def _check_performance_issues(code: str, language: str) -> List[Dict]:
        """Check for common performance issues"""
        issues = []
        
        # Nested loops detection
        if re.search(r'for.*for.*for', code, re.DOTALL):
            issues.append({
                'type': 'PERFORMANCE',
                'severity': 'MEDIUM',
                'message': 'Triple nested loops detected (O(n³) complexity)',
                'suggestion': 'Consider using more efficient algorithms',
                'priority': 2
            })
        
        # String concatenation in loop
        if re.search(r'for.*\+\s*["\']', code, re.DOTALL):
            issues.append({
                'type': 'PERFORMANCE',
                'severity': 'MEDIUM',
                'message': 'String concatenation in loop (inefficient)',
                'suggestion': 'Use array join or string builder instead',
                'priority': 2
            })
        
        # Multiple list iterations
        if code.count('for ') > 3:
            issues.append({
                'type': 'PERFORMANCE',
                'severity': 'LOW',
                'message': 'Multiple iterations over data structures',
                'suggestion': 'Combine iterations or use vectorized operations',
                'priority': 3
            })
        
        return issues

    @staticmethod
    def get_error_report(code: str, language: str = "python") -> str:
        """Generate a human-readable error report"""
        detection = ErrorDetector.detect_errors(code, language)
        
        report = []
        report.append("=" * 60)
        report.append("CODE ERROR DETECTION REPORT")
        report.append("=" * 60)
        report.append(f"Error Score: {detection['error_score']}/100")
        report.append(f"Total Errors: {detection['total_errors']}")
        report.append(f"Total Warnings: {detection['total_warnings']}")
        report.append(f"Error Density: {detection['error_density']:.2%}")
        report.append("")
        
        if detection['errors']:
            report.append("🔴 CRITICAL ERRORS:")
            for i, error in enumerate(detection['errors'], 1):
                report.append(f"  {i}. [{error['type']}] {error['message']}")
                report.append(f"     → {error['suggestion']}")
            report.append("")
        
        if detection['warnings']:
            report.append("⚠️  WARNINGS:")
            for i, warning in enumerate(detection['warnings'], 1):
                report.append(f"  {i}. [{warning['type']}] {warning['message']}")
                report.append(f"     → {warning['suggestion']}")
            report.append("")
        
        report.append("=" * 60)
        return "\n".join(report)
