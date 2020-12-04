export default {
  Post: {
    fields: ['media', 'commerce', 'user', 'funding', 'place','favorites_count','up_votes_count','up_votes_amount','up_vote_date','like_count','comments_count'],
    resources: [
      {
        User: {
          fields: ['id', 'avatar'],
          resources: []
        }
      },
    ]
  }
}