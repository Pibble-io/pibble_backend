export default {
  ChatRoom: {
    fields: [],
    resources: [
      {
        Post: {
          fields: ['media', 'commerce', 'user','place','favorites_count','up_votes_count','up_votes_amount','up_vote_date','like_count','comments_count'],
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
  },
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
}