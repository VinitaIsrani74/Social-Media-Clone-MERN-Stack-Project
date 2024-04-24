import PostModel from "../Models/PostModal.js";
import UserModel from "../Models/UserModal.js";
import mongoose, { Mongoose } from "mongoose";
//create post
export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);

  try {
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get post
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId.includes(userId)) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("post updated");
    } else {
      res.status(403).json("Access denied! You can update only your own post");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete a post
export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId.includes(userId)) {
      await post.deleteOne();
      res.status(200).json("post deleted");
    } else {
      res.status(403).json("Access denied! You can delete only your own post");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//like and dislike a post
export const likePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("post disliked");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get timeline post
export const getTimelinePost = async (req, res) => {
  const userId = req.params.id;
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: `ObjectId('${userId}')`,
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "Following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(currentUserPosts.concat(...followingPosts)
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
