const User = require("../models/User");


// Login user

exports.LoginUser = async (req,res) =>{
    const { email, password } = req.body;

    try{
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = user.generateAuthToken();

        res.status(200).json({ token });

    }
    catch(error0){
        res.status(500).json({ message: "Internal server error" }); 
    }


}