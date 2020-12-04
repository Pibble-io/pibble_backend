export default {
  ChatRoom: {
    fields: [],
    resources: [
      {
        ChatMessage: {
          fields: [],
          resources: [
            {
              User: {
                fields: ['id', 'avatar'],
                resources: []
              },
            }
          ]
        }
      },
      {
        ChatMember: {
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