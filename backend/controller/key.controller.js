import { User } from "../models/user.model.js";


export const getPublicKey = async (req, res) => {
  try {
    // Assuming user ID is added by auth middleware after verifying JWT
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }

    const user = await User.findById(userId).select('public_key');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "Public key is sent",
      public_key: user.public_key,
      success: true
    });

  } catch (error) {
    console.error('Error fetching public key:', error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};



