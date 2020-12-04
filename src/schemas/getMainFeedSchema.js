export default {
  Post: {
    fields: [],
    resources: [
      {
        User: {
          fields: ['id', 'avatar', 'report_level', 'balances'],
          resources: []
        }
      },
      {
        Comment: {
          fields: [],
          resources: [
            {
              User: {
                fields: ['id', 'avatar'],
                resources: []
              }
            }
          ]
        }
      }
    ]
  }
}