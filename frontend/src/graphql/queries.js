import { gql } from '@apollo/client';

// Problem queries
export const GET_PROBLEMS = gql`
  query GetProblems {
    problems {
      id
      title
      difficulty
      tags {
        name
      }
    }
  }
`;

export const GET_PROBLEM_BY_ID = gql`
  query GetProblemById($id: ID!) {
    problem(id: $id) {
      ... on ProblemType {
        id
        title
        description
        timeLimit
        memoryLimit
        difficulty
        tags
      }
      ... on ProblemNotFoundError {
        message
      }
    }
  }
`;

// User queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      username
      email
      isStaff
    }
  }
`;

export const RUN_CODE = gql`
  mutation RunCode($input: RunCodeInput!) {
    runCode(input: $input) {
      ... on RunCodeResult {
        success
        output
        testResults {
          testCase
          expected
          actual
          passed
          executionTime
        }
        totalExecutionTime
        memoryUsage
      }
      ... on RunCodeError {
        error
        errorType
        lineNumber
      }
    }
  }
`;
