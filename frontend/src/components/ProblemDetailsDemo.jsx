import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import ProblemDetails from '../pages/ProblemDetails';
import { mockProblemData, mockSubmissionResult } from '../mocks/problemData';

// Mock GraphQL queries for demonstration
const GET_PROBLEM_MOCK = {
  request: {
    query: require('../pages/ProblemDetails').GET_PROBLEM,
    variables: { id: '1' }
  },
  result: {
    data: mockProblemData
  }
};

const SUBMIT_SOLUTION_MOCK = {
  request: {
    query: require('../pages/ProblemDetails').SUBMIT_SOLUTION,
    variables: {
      problemId: '1',
      code: 'def twoSum(nums, target):\n    # Solution here\n    pass',
      language: 'python'
    }
  },
  result: {
    data: {
      submitSolution: mockSubmissionResult
    }
  }
};

const RUN_CODE_MOCK = {
  request: {
    query: require('../pages/ProblemDetails').RUN_CODE,
    variables: {
      problemId: '1',
      code: 'def twoSum(nums, target):\n    # Solution here\n    pass',
      language: 'python',
      input: '[2,7,11,15]\n9'
    }
  },
  result: {
    data: {
      runCode: {
        output: '[0, 1]',
        error: null,
        runtime: 45,
        memory: 14.2
      }
    }
  }
};

const mocks = [GET_PROBLEM_MOCK, SUBMIT_SOLUTION_MOCK, RUN_CODE_MOCK];

const ProblemDetailsDemo = () => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <BrowserRouter>
        <div style={{ width: '100vw', height: '100vh' }}>
          <ProblemDetails />
        </div>
      </BrowserRouter>
    </MockedProvider>
  );
};

export default ProblemDetailsDemo;