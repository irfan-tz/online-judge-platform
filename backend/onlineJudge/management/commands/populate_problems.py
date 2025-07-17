from django.core.management.base import BaseCommand
from onlineJudge.models import Problem

class Command(BaseCommand):
    help = 'Populate the database with sample CP problems'

    def handle(self, *args, **kwargs):
        problems = [
            # Easy problems
            {
                'title': 'Sum of Two Numbers',
                'description': 'Given two integers, return their sum.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['math', 'beginner']
            },
            {
                'title': 'Maximum of Three Numbers',
                'description': 'Find the maximum of three integers.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['math', 'comparison']
            },
            {
                'title': 'Reverse a String',
                'description': 'Given a string, return its reverse.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['string', 'beginner']
            },
            {
                'title': 'Area of a Circle',
                'description': 'Calculate the area of a circle given its radius.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['math', 'geometry']
            },
            {
                'title': 'Fibonacci Sequence',
                'description': 'Generate the Fibonacci sequence up to n terms.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['math', 'sequence']
            },
            {
                'title': 'Palindrome Checker',
                'description': 'Check if a given string is a palindrome.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['string', 'palindrome']
            },
            {
                'title': 'Count Vowels in a String',
                'description': 'Count the number of vowels in a given string.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['string', 'counting']
            },
            {
                'title': 'Sum of Digits',
                'description': 'Calculate the sum of digits of an integer.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['math', 'digits']
            },
            {
                'title': 'Find the Largest Number',
                'description': 'Find the largest number in a list.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['algorithm', 'search']
            },
            {
                'title': 'Sort a List',
                'description': 'Sort a given list in ascending order.',
                'time_limit': '1s',
                'memory_limit': '256MB',
                'difficulty': 'Easy',
                'tags': ['algorithm', 'sort']
            },
            # Medium problems
            {
                'title': 'Binary Search',
                'description': 'Implement binary search on a sorted array.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['algorithm', 'search']
            },
            {
                'title': 'Merge Sort',
                'description': 'Implement merge sort algorithm.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['algorithm', 'sort']
            },
            {
                'title': 'Quick Sort',
                'description': 'Implement quick sort algorithm.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['algorithm', 'sort']
            },
            {
                'title': 'Dijkstra\'s Algorithm',
                'description': 'Find the shortest path in a graph using Dijkstra\'s algorithm.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['algorithm', 'graph']
            },
            {
                'title': 'Knapsack Problem',
                'description': 'Solve the 0/1 knapsack problem using dynamic programming.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['algorithm', 'dynamic-programming']
            },
            {
                'title': 'Longest Common Subsequence',
                'description': 'Find the longest common subsequence of two strings.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['algorithm', 'dynamic-programming']
            },
            {
                'title': 'Matrix Multiplication',
                'description': 'Multiply two matrices.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['math', 'matrix']
            },
            {
                'title': 'Prime Factorization',
                'description': 'Find the prime factors of a given number.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['math', 'factors']
            },
            {
                'title': 'Sieve of Eratosthenes',
                'description': 'Find all prime numbers up to n using the Sieve of Eratosthenes.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['math', 'prime']
            },
            {
                'title': 'Balanced Parentheses',
                'description': 'Check if the parentheses in an expression are balanced.',
                'time_limit': '2s',
                'memory_limit': '512MB',
                'difficulty': 'Medium',
                'tags': ['string', 'parentheses']
            },
            # Hard problems
            {
                'title': 'N-Queens Problem',
                'description': 'Solve the N-Queens problem using backtracking.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'backtracking']
            },
            {
                'title': 'Sudoku Solver',
                'description': 'Solve a Sudoku puzzle using backtracking.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'backtracking']
            },
            {
                'title': 'Travelling Salesman Problem',
                'description': 'Solve the Travelling Salesman Problem using dynamic programming.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'dynamic-programming']
            },
            {
                'title': 'Maximum Subarray Sum',
                'description': 'Find the maximum sum of a subarray using Kadane\'s algorithm.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'dynamic-programming']
            },
            {
                'title': 'Edit Distance',
                'description': 'Find the minimum edit distance between two strings.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'dynamic-programming']
            },
            {
                'title': 'Longest Increasing Subsequence',
                'description': 'Find the longest increasing subsequence in an array.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'dynamic-programming']
            },
            {
                'title': 'Word Ladder',
                'description': 'Find the shortest transformation sequence between two words.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'graph']
            },
            {
                'title': 'Minimum Spanning Tree',
                'description': 'Find the minimum spanning tree of a graph using Prim\'s or Kruskal\'s algorithm.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'graph']
            },
            {
                'title': 'Network Flow',
                'description': 'Calculate the maximum flow in a flow network using the Ford-Fulkerson method.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'graph']
            },
            {
                'title': 'Strongly Connected Components',
                'description': 'Find strongly connected components in a directed graph using Tarjan\'s algorithm.',
                'time_limit': '3s',
                'memory_limit': '1024MB',
                'difficulty': 'Hard',
                'tags': ['algorithm', 'graph']
            },
        ]

        for problem_data in problems:
            problem, created = Problem.objects.get_or_create(
                title=problem_data['title'],
                defaults={
                    'description': problem_data['description'],
                    'time_limit': problem_data['time_limit'],
                    'memory_limit': problem_data['memory_limit'],
                    'difficulty': problem_data['difficulty'],
                }
            )
            if created:
                problem.tags.add(*problem_data['tags'])
                self.stdout.write(self.style.SUCCESS(f"Added problem: {problem.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"Problem already exists: {problem.title}"))