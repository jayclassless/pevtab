export const samplePlanJson = JSON.stringify([
  {
    Plan: {
      'Node Type': 'Seq Scan',
      'Relation Name': 'users',
      Alias: 'users',
      'Startup Cost': 0.0,
      'Total Cost': 12.1,
      'Plan Rows': 210,
      'Plan Width': 64,
    },
    'Planning Time': 0.05,
    'Execution Time': 0.12,
  },
])

export const sampleQuery = 'SELECT * FROM users'

export const samplePlanName = 'Test Plan'
