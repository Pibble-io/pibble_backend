export default {
  ChatGroup: {
    fields: [],
    resources: [
      {
        Post: {
          fields: ['media', 'commerce', 'user','place','favorites_count','up_votes_count','up_votes_amount','up_vote_date','like_count','comments_count'],
          resources: []
        }
      },
      {
        ChatRoom: {
          fields: ['last_message', 'members'],
          resources: [
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
                  },
                  {
                    Post: {
                      fields: ['media', 'commerce', 'user','place','favorites_count','up_votes_count','up_votes_amount','up_vote_date','like_count','comments_count'],
                      resources: []
                    },
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}