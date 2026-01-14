# Generate Tests Command

When this command is invoked, generate comprehensive tests for the specified code or component.

## Test Generation Process

1. **Analyze the Code**
   - Identify the component/function being tested
   - Understand inputs, outputs, and side effects
   - Identify dependencies that need mocking
   - Understand the expected behavior

2. **Test Structure**
   - Create test file in appropriate location (**tests** directory or co-located)
   - Use appropriate testing framework (Jest, React Testing Library, etc.)
   - Organize tests into logical describe blocks
   - Use clear, descriptive test names

3. **Test Coverage**
   - **Happy Path**: Test normal, expected behavior
   - **Edge Cases**: Test boundary conditions, empty inputs, null values
   - **Error Cases**: Test error handling and failure scenarios
   - **Integration Points**: Test interactions with dependencies

4. **Test Quality**
   - Follow AAA pattern (Arrange, Act, Assert)
   - Use descriptive test names that explain what is being tested
   - Keep tests focused (one concept per test)
   - Mock external dependencies appropriately
   - Clean up after tests (if needed)

## Test File Structure

### For React Components

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render with required props', () => {
      // Arrange
      const props = {
        /* ... */
      };

      // Act
      render(<ComponentName {...props} />);

      // Assert
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {
      // Test interaction
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing props gracefully', () => {
      // Test edge case
    });
  });
});
```

### For Functions/Services

```javascript
import { functionName } from './module';

describe('functionName', () => {
  it('should return expected result for valid input', () => {
    // Arrange
    const input = {
      /* ... */
    };
    const expected = {
      /* ... */
    };

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should throw error for invalid input', () => {
    // Test error case
  });
});
```

## Testing Best Practices

- **Isolation**: Each test should be independent
- **Clarity**: Test names should clearly describe what's being tested
- **Completeness**: Cover all code paths when possible
- **Maintainability**: Tests should be easy to update when code changes
- **Performance**: Tests should run quickly
- **No Flakiness**: Tests should be deterministic and reliable

## Dependencies to Mock

- API calls (use mock service workers or jest.mock)
- Database operations
- External services
- File system operations
- Timer functions (setTimeout, setInterval)
- Browser APIs (when testing in Node.js)

## Test Output

Generate:

1. Complete test file with all necessary imports
2. Test cases covering happy paths, edge cases, and errors
3. Proper mocking setup
4. Comments explaining complex test scenarios
5. Instructions for running the tests

## Framework-Specific Notes

- **Jest**: Default testing framework
- **React Testing Library**: For React component tests
- **Supertest**: For API endpoint testing
- **Mock Service Worker**: For API mocking (if used)
