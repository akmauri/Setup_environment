# Monitoring Dashboard Setup Instructions

This document provides instructions for setting up a monitoring dashboard to track AI agent development system metrics.

## Dashboard Options

### Option 1: Simple HTML Dashboard (Recommended for Start)

**Location**: `monitoring/dashboard.html`

**Features**:
- Real-time task status
- Agent activity
- Error tracking
- Performance metrics

**Setup**:
1. Create `monitoring/` directory
2. Copy dashboard template (see below)
3. Open `dashboard.html` in browser
4. Refresh to see updates

**Pros**: Simple, no dependencies, works immediately
**Cons**: Manual refresh, basic features

### Option 2: Next.js Dashboard (Integrated)

**Location**: `apps/monitoring/` (if using monorepo)

**Features**:
- Real-time updates (WebSocket)
- Interactive charts
- Filtering and search
- Historical data

**Setup**:
1. Create Next.js app in `apps/monitoring/`
2. Implement dashboard components
3. Connect to task JSON and logs
4. Deploy alongside main app

**Pros**: Integrated, real-time, feature-rich
**Cons**: More complex, requires deployment

### Option 3: Grafana Dashboard (Advanced)

**Location**: External Grafana instance

**Features**:
- Professional dashboards
- Alerting
- Historical analysis
- Multiple data sources

**Setup**:
1. Set up Grafana instance
2. Configure data sources (JSON files, logs)
3. Create dashboards
4. Set up alerts

**Pros**: Professional, powerful, scalable
**Cons**: Requires infrastructure, more setup

## Recommended: Simple HTML Dashboard

### Dashboard Template

Create `monitoring/dashboard.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Agent Development Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { font-size: 12px; color: #666; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>AI Agent Development Dashboard</h1>
    <p>Last updated: <span id="lastUpdate"></span></p>
    
    <div class="metrics">
        <div class="metric">
            <div class="metric-value" id="totalTasks">-</div>
            <div class="metric-label">Total Tasks</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="pendingTasks">-</div>
            <div class="metric-label">Pending</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="inProgressTasks">-</div>
            <div class="metric-label">In Progress</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="completedTasks">-</div>
            <div class="metric-label">Completed</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="blockedTasks">-</div>
            <div class="metric-label">Blocked</div>
        </div>
    </div>
    
    <h2>Recent Activity</h2>
    <table id="activityTable">
        <thead>
            <tr>
                <th>Time</th>
                <th>Agent</th>
                <th>Task</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    
    <script>
        // Load task data (requires local server or CORS setup)
        async function loadDashboard() {
            try {
                const response = await fetch('../agent_tasks/todo_progress.json');
                const data = await response.json();
                
                const tasks = data.tasks || [];
                const statusCounts = tasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {});
                
                document.getElementById('totalTasks').textContent = tasks.length;
                document.getElementById('pendingTasks').textContent = statusCounts.pending || 0;
                document.getElementById('inProgressTasks').textContent = statusCounts.in_progress || 0;
                document.getElementById('completedTasks').textContent = statusCounts.completed || 0;
                document.getElementById('blockedTasks').textContent = statusCounts.blocked || 0;
                
                document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }
        
        // Load on page load
        loadDashboard();
        
        // Auto-refresh every 30 seconds
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>
```

### Setup Instructions

1. **Create monitoring directory**:
   ```bash
   mkdir -p monitoring
   ```

2. **Create dashboard file**: Copy template above to `monitoring/dashboard.html`

3. **Serve locally** (to avoid CORS issues):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

4. **Open in browser**: Navigate to `http://localhost:8000/monitoring/dashboard.html`

5. **Auto-refresh**: Dashboard refreshes every 30 seconds

## Metrics to Track

### Task Metrics
- Total tasks
- Tasks by status (pending, in_progress, completed, blocked)
- Tasks by priority
- Tasks by complexity
- Average completion time
- Tasks per agent

### Agent Metrics
- Active agents
- Agent workload
- Agent activity (tasks completed)
- Agent errors
- Agent communication

### Error Metrics
- Error rate
- Common errors
- Error resolution time
- Retry counts
- Blocked tasks

### Performance Metrics
- Task completion rate
- Average task time
- Agent utilization
- Lock conflicts
- Dependency resolution time

## Data Sources

### Primary Sources
- `agent_tasks/todo_progress.json` - Task status
- `agent_tasks/completed_tasks.json` - Completed tasks
- `logs/agent_activity/` - Agent activity logs
- `logs/agent_errors/` - Error logs
- `logs/performance/` - Performance metrics

### Script to Generate Metrics

Create `scripts/generate_metrics.js` to aggregate metrics:

```javascript
// Aggregates metrics from various sources
// Outputs to logs/performance/[date]_metrics.log
```

## Advanced Setup

### Real-time Updates

For real-time updates, consider:
- WebSocket server
- Server-Sent Events (SSE)
- Polling with shorter intervals

### Historical Data

Store historical metrics:
- Daily snapshots
- Weekly summaries
- Monthly reports

### Alerts

Set up alerts for:
- High error rate
- Many blocked tasks
- Lock conflicts
- Performance degradation

## Integration with Existing Systems

If using monitoring tools (Prometheus, Grafana, etc.):
- Export metrics in standard format
- Use existing dashboards
- Integrate with alerting systems

## Maintenance

- Review dashboard weekly
- Update metrics as needed
- Archive old data
- Optimize performance
