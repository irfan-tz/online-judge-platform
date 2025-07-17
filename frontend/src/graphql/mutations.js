import { gql } from '@apollo/client';

// Authentication mutations
export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $username: String!) {
    signUp(email: $email, password: $password, username: $username) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

export const ADMIN_LOGIN_MUTATION = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      token
      isStaff
    }
  }
`;

// Problem mutations
export const CREATE_PROBLEM_MUTATION = gql`
  mutation CreateProblem(
    $title: String!
    $description: String!
    $timeLimit: String!
    $memoryLimit: String!
    $difficulty: String!
    $tags: [String!]!
    $testcaseFile: Upload
  ) {
    createProblem(
      title: $title
      description: $description
      timeLimit: $timeLimit
      memoryLimit: $memoryLimit
      difficulty: $difficulty
      tags: $tags
      testcaseFile: $testcaseFile
    ) {
      id
      title
    }
  }
`;

// ... (The rest of the mutations can stay the same)
export const SUBMIT_SOLUTION = gql`
  mutation SubmitSolution($problemId: ID!, $code: String!, $language: String!) {
    submitSolution(
      problemId: $problemId
      code: $code
      language: $language
    ) {
      id
      status
      runtime
      memory
      result
    }
  }
`;

export const UPDATE_PROBLEM_MUTATION = gql`
  mutation UpdateProblem(
    $id: ID!
    $title: String
    $description: String
    $timeLimit: String
    $memoryLimit: String
    $difficulty: String
    $tags: [String!]
  ) {
    updateProblem(
      id: $id
      title: $title
      description: $description
      timeLimit: $timeLimit
      memoryLimit: $memoryLimit
      difficulty: $difficulty
      tags: $tags
    ) {
      id
      title
    }
  }
`;

export const DELETE_PROBLEM_MUTATION = gql`
  mutation DeleteProblem($id: ID!) {
    deleteProblem(id: $id) {
      success
    }
  }
`;