export default {
  Post: {
    fields: [],
    resources: [
      {
        User: {
          fields: ['id', 'avatar', 'report_level','favorites_count','up_votes_count','up_votes_amount','up_vote_date','like_count','comments_count'],
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