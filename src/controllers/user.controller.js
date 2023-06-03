const User = require("../schema/user.schema");
const Post = require("../schema/post.schema")

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    const startIndex = (page - 1) * limit; // Calculate the starting index of the users for the current page

    const users = await User.find() // Find all users
      .skip(startIndex) // Skip the users before the starting index
      .limit(limit) // Limit the number of users per page
      .exec();

    const totalCount = await User.countDocuments(); // Get the total count of users

    const usersWithPostCount = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({ userId: user._id }); // Get the post count for each user
        return {
          _id: user._id,
          name: user.name,
          posts: postCount,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

    const hasNextPage = page < totalPages; // Determine if there is a next page
    const nextPage = hasNextPage ? page + 1 : null; // Calculate the next page number if it exists

    const response = {
      data: {
        users: usersWithPostCount,
        pagination: {
          totalDocs: totalCount,
          limit : limit,
          page : page,
          totalPages,
          pagingCounter: startIndex + 1,
          hasPrevPage: page > 1,
          hasNextPage,
          prevPage: page > 1 ? page - 1 : null,
          nextPage,
        },
      },
    };
    console.log("response : ", response );

    res.status(200).json(response);
  } catch (error) {
        res.send({ error: error.message });
      }
};



