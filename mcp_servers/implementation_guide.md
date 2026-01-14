# MCP Server Implementation Guide

This guide explains when and how to implement MCP (Model Context Protocol) servers for custom tooling and integrations.

## When to Implement MCP Servers

Implement an MCP server when **ANY** of the following criteria are met:

1. **Custom Tooling Needed**: You need tools that don't exist in standard MCP servers
2. **Integration with Proprietary Systems**: You need to integrate with internal or proprietary systems
3. **Performance-Critical Operations**: Operations that need to be optimized for speed
4. **Security-Sensitive Operations**: Operations that require special security handling

### Examples

✅ **Good Candidates**:
- Custom database query tools
- Proprietary API integrations
- Internal service integrations
- Performance-critical data processing
- Secure credential management

❌ **Not Good Candidates**:
- Standard operations (use existing MCP servers)
- Simple file operations (use file system MCP)
- Standard API calls (use HTTP MCP)
- Operations that can be done in code

## MCP Server Structure

### Directory Structure

```
mcp_servers/
├── [server_name]/
│   ├── src/
│   │   ├── index.ts          # Main server file
│   │   ├── tools/            # Tool implementations
│   │   └── types.ts          # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
```

### Basic MCP Server Template

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'your-server-name',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'your-tool-name',
      description: 'Tool description',
      inputSchema: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'Parameter description',
          },
        },
        required: ['param1'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'your-tool-name':
      // Implement tool logic
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ result: 'success' }),
          },
        ],
      };
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch(console.error);
```

## Implementation Process

### Step 1: Define Requirements

1. **Identify Need**: What tool/operation is needed?
2. **Check Existing**: Does an MCP server already provide this?
3. **Define Interface**: What inputs/outputs are needed?
4. **Security Considerations**: What security is required?

### Step 2: Design Tool Interface

1. **Tool Name**: Clear, descriptive name
2. **Description**: What the tool does
3. **Input Schema**: JSON schema for inputs
4. **Output Format**: Expected output format
5. **Error Handling**: How errors are handled

### Step 3: Implement Server

1. **Create Server Structure**: Use template above
2. **Implement Tools**: Write tool logic
3. **Add Error Handling**: Handle errors gracefully
4. **Add Logging**: Log operations for debugging

### Step 4: Test Server

1. **Unit Tests**: Test individual tools
2. **Integration Tests**: Test with MCP client
3. **Error Tests**: Test error handling
4. **Performance Tests**: Test performance if critical

### Step 5: Document Server

1. **README.md**: Document server purpose and usage
2. **Tool Documentation**: Document each tool
3. **Examples**: Provide usage examples
4. **Configuration**: Document configuration options

### Step 6: Deploy Server

1. **Package Server**: Create npm package if needed
2. **Configure MCP Client**: Add to MCP client configuration
3. **Test Deployment**: Verify server works in environment
4. **Monitor**: Monitor server performance

## Testing Procedures

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest';
import { yourToolFunction } from './tools/your-tool';

describe('Your Tool', () => {
  it('should handle valid input', async () => {
    const result = await yourToolFunction({ param1: 'value' });
    expect(result).toBeDefined();
  });

  it('should handle errors', async () => {
    await expect(
      yourToolFunction({ param1: 'invalid' })
    ).rejects.toThrow();
  });
});
```

### Integration Testing

1. Start MCP server
2. Connect MCP client
3. List tools
4. Call tools with various inputs
5. Verify outputs
6. Test error cases

### Performance Testing

1. Measure tool execution time
2. Test with various input sizes
3. Identify bottlenecks
4. Optimize if needed

## Security Considerations

### Authentication

- Use secure authentication methods
- Store credentials securely
- Never expose credentials in logs

### Authorization

- Verify user permissions
- Validate inputs
- Sanitize outputs

### Data Protection

- Encrypt sensitive data
- Use secure connections
- Follow data protection regulations

## Integration with Existing MCP Setup

### Configuration

Add to MCP client configuration:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "node",
      "args": ["path/to/your-server/src/index.ts"]
    }
  }
}
```

### Usage

Agents can use your MCP server tools like any other MCP tool:

```typescript
// In agent code
const result = await mcpClient.callTool('your-server', 'your-tool-name', {
  param1: 'value'
});
```

## Best Practices

1. **Keep Tools Focused**: One tool, one purpose
2. **Document Thoroughly**: Clear documentation
3. **Handle Errors**: Graceful error handling
4. **Log Operations**: Log for debugging
5. **Test Extensively**: Comprehensive testing
6. **Version Control**: Track versions
7. **Security First**: Security by design

## Maintenance

- Review servers monthly
- Update dependencies
- Monitor performance
- Remove unused servers
- Update documentation

## Examples

### Example 1: Custom Database Tool

```typescript
// Tool for custom database queries
{
  name: 'query-custom-db',
  description: 'Execute custom database query',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      params: { type: 'array' },
    },
    required: ['query'],
  },
}
```

### Example 2: Proprietary API Integration

```typescript
// Tool for proprietary API
{
  name: 'call-proprietary-api',
  description: 'Call internal proprietary API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: { type: 'string' },
      method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
      body: { type: 'object' },
    },
    required: ['endpoint', 'method'],
  },
}
```

## Troubleshooting

### Common Issues

1. **Server Not Starting**: Check configuration and dependencies
2. **Tool Not Found**: Verify tool is registered
3. **Authentication Errors**: Check credentials
4. **Performance Issues**: Profile and optimize

### Debugging

1. Enable verbose logging
2. Check server logs
3. Test tools independently
4. Use MCP client debug mode
