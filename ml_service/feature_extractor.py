"""
Feature Extractor - Extract code quality features for ML model
"""

import re
from typing import Dict, List, Tuple


class CodeFeatureExtractor:
    """Extract features from code for ML analysis"""

    @staticmethod
    def extract_features(code: str) -> Dict[str, float]:
        """
        Extract features from code
        
        Returns:
            Dictionary with feature names and values
        """
        features = {}
        
        # Basic metrics
        features['num_lines'] = len(code.split('\n'))
        features['num_characters'] = len(code)
        features['num_words'] = len(code.split())
        
        # Function analysis
        features['num_functions'] = CodeFeatureExtractor._count_functions(code)
        features['avg_function_length'] = CodeFeatureExtractor._avg_function_length(code)
        
        # Complexity metrics
        features['max_nesting_depth'] = CodeFeatureExtractor._max_nesting_depth(code)
        features['num_unused_vars'] = CodeFeatureExtractor._count_unused_vars(code)
        features['num_comments'] = CodeFeatureExtractor._count_comments(code)
        features['comment_ratio'] = CodeFeatureExtractor._comment_ratio(code)
        
        # Code quality indicators
        features['has_error_handling'] = 1.0 if CodeFeatureExtractor._has_error_handling(code) else 0.0
        features['has_type_hints'] = 1.0 if CodeFeatureExtractor._has_type_hints(code) else 0.0
        features['cyclomatic_complexity'] = CodeFeatureExtractor._cyclomatic_complexity(code)
        
        # Normalized features
        features['complexity_score'] = min(features['max_nesting_depth'] * 10, 100)
        features['maintainability_score'] = CodeFeatureExtractor._maintainability_score(features)
        
        return features

    @staticmethod
    def _count_functions(code: str) -> float:
        """Count number of functions/methods"""
        patterns = [
            r'def\s+\w+\s*\(',  # Python functions
            r'function\s+\w+\s*\(',  # JS function declarations
            r'\w+\s*\(\s*\)',  # Function calls/definitions
        ]
        count = 0
        for pattern in patterns:
            count += len(re.findall(pattern, code))
        return float(count)

    @staticmethod
    def _avg_function_length(code: str) -> float:
        """Calculate average function length"""
        functions = re.findall(r'def\s+\w+.*?(?=\ndef|\nclass|\Z)', code, re.DOTALL)
        if not functions:
            functions = re.findall(r'function\s+\w+.*?[}\)]', code, re.DOTALL)
        
        if functions:
            avg_length = sum(len(f.split('\n')) for f in functions) / len(functions)
            return float(avg_length)
        return 0.0

    @staticmethod
    def _max_nesting_depth(code: str) -> float:
        """Calculate maximum nesting depth"""
        lines = code.split('\n')
        max_depth = 0
        
        for line in lines:
            # Count leading spaces/tabs
            stripped = line.lstrip()
            if stripped and not stripped.startswith('#'):
                depth = (len(line) - len(stripped)) // 4  # Assuming 4-space indentation
                max_depth = max(max_depth, depth)
        
        return float(max_depth)

    @staticmethod
    def _count_unused_vars(code: str) -> float:
        """Estimate unused variables (simplified)"""
        # This is a simplified heuristic
        var_assignments = len(re.findall(r'=\s*(?![=])', code))
        var_usage = len(re.findall(r'\b\w+\b', code)) - var_assignments
        unused = max(0, var_assignments - var_usage)
        return float(unused)

    @staticmethod
    def _count_comments(code: str) -> float:
        """Count comment lines"""
        comment_lines = len(re.findall(r'^\s*[#//]', code, re.MULTILINE))
        block_comments = len(re.findall(r'""".*?"""', code, re.DOTALL))
        return float(comment_lines + block_comments)

    @staticmethod
    def _comment_ratio(code: str) -> float:
        """Calculate comment to code ratio"""
        total_lines = len(code.split('\n'))
        if total_lines == 0:
            return 0.0
        
        comment_lines = CodeFeatureExtractor._count_comments(code)
        return float(comment_lines / total_lines)

    @staticmethod
    def _has_error_handling(code: str) -> bool:
        """Check if code has error handling"""
        patterns = [
            r'try\s*:',
            r'except\s+',
            r'catch\s*\(',
            r'throw\s+',
            r'raise\s+',
        ]
        return any(re.search(pattern, code) for pattern in patterns)

    @staticmethod
    def _has_type_hints(code: str) -> bool:
        """Check if code has type hints"""
        patterns = [
            r':\s*\w+',  # Python type hints
            r':\s*\w+\s*=',  # JS/TS type hints
            r'<\w+>',  # Generics
        ]
        return any(re.search(pattern, code) for pattern in patterns)

    @staticmethod
    def _cyclomatic_complexity(code: str) -> float:
        """Calculate cyclomatic complexity (simplified)"""
        complexity = 1  # Base complexity
        
        # Count decision points
        patterns = [
            r'\bif\b',
            r'\belif\b',
            r'\belse\b',
            r'\bfor\b',
            r'\bwhile\b',
            r'\bswitch\b',
            r'\bcase\b',
            r'\bcatch\b',
            r'[?]:',  # Ternary operator
        ]
        
        for pattern in patterns:
            complexity += len(re.findall(pattern, code))
        
        return float(complexity)

    @staticmethod
    def _maintainability_score(features: Dict[str, float]) -> float:
        """Calculate maintainability score (0-100)"""
        score = 100.0
        
        # Penalize high nesting depth
        if features['max_nesting_depth'] > 4:
            score -= features['max_nesting_depth'] * 5
        
        # Penalize low comments
        if features['comment_ratio'] < 0.1:
            score -= 20
        
        # Penalize high cyclomatic complexity
        if features['cyclomatic_complexity'] > 20:
            score -= features['cyclomatic_complexity']
        
        # Reward error handling
        if features['has_error_handling'] == 1.0:
            score += 10
        
        # Reward type hints
        if features['has_type_hints'] == 1.0:
            score += 15
        
        return max(0, min(score, 100))
