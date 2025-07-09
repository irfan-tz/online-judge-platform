// Mock data for testing ProblemDetails component
export const mockProblemData = {
  problem: {
    id: "1",
    title: "Two Sum",
    description: `
      <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
      <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
      <p>You can return the answer in any order.</p>
    `,
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    timeLimit: 1000,
    memoryLimit: 256,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
      }
    ],
    constraints: `
      <ul>
        <li><code>2 <= nums.length <= 10<sup>4</sup></code></li>
        <li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
        <li><code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code></li>
        <li><strong>Only one valid answer exists.</strong></li>
      </ul>
    `,
    hints: `
      <ul>
        <li>A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.</li>
        <li>So, if we fix one of the numbers, say <code>x</code>, we have to scan the entire array to find the next number <code>y</code> which is <code>value - x</code> where value is the input parameter. Can we change our array somehow so that this search becomes faster?</li>
        <li>The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?</li>
      </ul>
    `,
    defaultCode: [
      {
        language: "python",
        code: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here
    pass`
      },
      {
        language: "javascript",
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`
      },
      {
        language: "java",
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`
      },
      {
        language: "cpp",
        code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`
      }
    ]
  }
};

export const mockSubmissionResult = {
  id: "sub_123",
  status: "ACCEPTED",
  runtime: 64,
  memory: 15.2,
  output: "[0,1]",
  error: null,
  testCases: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      passed: true,
      runtime: 32,
      memory: 14.1
    },
    {
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]",
      actualOutput: "[1,2]",
      passed: true,
      runtime: 28,
      memory: 14.3
    },
    {
      input: "nums = [3,3], target = 6",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      passed: true,
      runtime: 30,
      memory: 14.0
    }
  ]
};

export const mockFailedSubmissionResult = {
  id: "sub_124",
  status: "WRONG_ANSWER",
  runtime: 45,
  memory: 14.8,
  output: "[1,0]",
  error: null,
  testCases: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      passed: true,
      runtime: 32,
      memory: 14.1
    },
    {
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]",
      actualOutput: "[1,2]",
      passed: true,
      runtime: 28,
      memory: 14.3
    },
    {
      input: "nums = [3,3], target = 6",
      expectedOutput: "[0,1]",
      actualOutput: "[1,0]",
      passed: false,
      runtime: 30,
      memory: 14.0
    }
  ]
};

export const mockRuntimeErrorResult = {
  id: "sub_125",
  status: "RUNTIME_ERROR",
  runtime: null,
  memory: null,
  output: null,
  error: "IndexError: list index out of range\n    at line 5 in twoSum\n    nums[i] + nums[j] == target",
  testCases: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      actualOutput: null,
      passed: false,
      runtime: null,
      memory: null
    }
  ]
};

export const mockRunCodeResult = {
  output: "[0, 1]",
  error: null,
  runtime: 45,
  memory: 14.2
};

export const mockRunCodeErrorResult = {
  output: null,
  error: "SyntaxError: invalid syntax\n    at line 3\n    def twoSum(nums, target\n                            ^\nSyntaxError: invalid syntax",
  runtime: null,
  memory: null
};

// Additional mock problems for variety
export const mockProblems = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"]
  },
  {
    id: "2",
    title: "Add Two Numbers",
    difficulty: "Medium",
    tags: ["Linked List", "Math", "Recursion"]
  },
  {
    id: "3",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"]
  },
  {
    id: "4",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "Divide and Conquer"]
  },
  {
    id: "5",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"]
  }
];

export const mockComplexProblem = {
  problem: {
    id: "42",
    title: "Trapping Rain Water",
    description: `
      <p>Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.</p>
      <p><img src="https://assets.leetcode.com/uploads/2018/10/22/rainwatertrap.png" alt="Trapping Rain Water" style="width: 412px; height: 161px;"></p>
    `,
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    timeLimit: 2000,
    memoryLimit: 512,
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped."
      },
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9",
        explanation: "The above elevation map is represented by array [4,2,0,3,2,5]. In this case, 9 units of rain water are being trapped."
      }
    ],
    constraints: `
      <ul>
        <li><code>n == height.length</code></li>
        <li><code>1 <= n <= 2 * 10<sup>4</sup></code></li>
        <li><code>0 <= height[i] <= 3 * 10<sup>4</sup></code></li>
      </ul>
    `,
    hints: `
      <ol>
        <li>For each element in the array, we find the maximum level of water it can trap after the rain, which is equal to the minimum of maximum height of bars on both the sides minus its own height.</li>
        <li>Can you think of a way to compute the left and right max arrays more efficiently?</li>
        <li>Instead of computing the left and right parts separately, think about doing it in one iteration.</li>
      </ol>
    `,
    defaultCode: [
      {
        language: "python",
        code: `def trap(height):
    """
    :type height: List[int]
    :rtype: int
    """
    # Your code here
    pass`
      },
      {
        language: "javascript",
        code: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    // Your code here
};`
      },
      {
        language: "java",
        code: `class Solution {
    public int trap(int[] height) {
        // Your code here
        return 0;
    }
}`
      },
      {
        language: "cpp",
        code: `class Solution {
public:
    int trap(vector<int>& height) {
        // Your code here
        return 0;
    }
};`
      }
    ]
  }
};