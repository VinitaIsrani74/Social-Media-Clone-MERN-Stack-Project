import userModel from "../Models/UserModal.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

//get all users
export const getAllUsers = async (req, res) => {
  try {
    let users = await userModel.find();
    users = users.map((user) =>{
      const {password, ...otherDetails} = user._doc
      return otherDetails
    })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get a user
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await userModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(400).json("user not here!");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update a user
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdminStatus, password } = req.body;

  if (id === _id) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      const user = await userModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        {username: user.username, id:user._id},
        "MERN",
        {expiresIn: "1h"}
      )
      res.status(200).json({user, token});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(404).json("Access denied!");
  }
};

//delete a user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdminStatus } = req.body;
  if (id === currentUserId || currentUserAdminStatus) {
    try {
      await userModel.findByIdAndDelete(id);
      res.status(200).json("user deleted successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res
      .status(404)
      .json("Access denied! You can only delete your own profile!");
  }
};

//follow a user
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if (id === _id) {
    res.status(404).json("Action forbidden!");
  } else {
    try {
      const followUser = await userModel.findById(id);
      const followingUser = await userModel.findById(_id);

      if (!followUser.Followers.includes(_id)) {
        await followUser.updateOne({ $push: { Followers: _id } });
        await followingUser.updateOne({ $push: { Following: id } });
        res.status(200).json("User followed");
      } else {
        res.status(400).json("already followed by you");
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

//unfollow a user
export const unFollowUser = async (req, res) => {
    const id = req.params.id;
    const { _id } = req.body;
  
    if (id === _id) {
      res.status(404).json("Action forbidden!");
    } else {
      try {
        const followUser = await userModel.findById(id);
        const followingUser = await userModel.findById(_id);
  
        if (followUser.Followers.includes(_id)) {
          await followUser.updateOne({ $pull: { Followers: _id } });
          await followingUser.updateOne({ $pull: { Following: id } });
          res.status(200).json("User unfollowed");
        } else {
          res.status(400).json("User is not followed by you");
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  };
  