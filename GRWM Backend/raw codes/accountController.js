const Account = require("../models/accountDetails");
const Razorpay = require("razorpay");
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 📌 Create Account Details
exports.createAccountDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } =
      req.body;

    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({
        success: false,
        message: "All fields except UPI ID are required.",
      });
    }

    // Name validation - only letters & spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(accountHolderName.trim())) {
      return res.status(400).json({
        success: false,
        message: "Account holder name must contain only letters and spaces.",
      });
    }

    // Account number validation - digits only, 9 to 18 length
    const accountNumberRegex = /^\d{9,18}$/;
    if (!accountNumberRegex.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Account number must be 9 to 18 digits long and contain digits only.",
      });
    }

    // IFSC Code validation - 4 letters + 0 + 6 digits (e.g., HDFC0001234)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
    if (!ifscRegex.test(ifscCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC code format.",
      });
    }

    // Bank name validation - letters & spaces only
    const bankNameRegex = /^[A-Za-z\s]+$/;
    if (!bankNameRegex.test(bankName.trim())) {
      return res.status(400).json({
        success: false,
        message: "Bank name must contain only letters and spaces.",
      });
    }

    // Optional UPI ID validation
    if (upiId) {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(upiId.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid UPI ID format.",
        });
      }
    }

    const existingAccount = await Account.findOne({ userId });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Account details already exist. You can update it.",
      });
    }

    // 🧠 Fetch User Details (for Razorpay account creation)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 🔁 Create Razorpay Sub-Account (Route)
    const razorpayAccount = await razorpay.accounts.create({
      name: accountHolderName,
      email: user.email,
      contact: user.phone, // optional but good to have
      type: "individual", // or 'company'
      bank_account: {
        name: accountHolderName,
        ifsc: ifscCode,
        account_number: accountNumber,
      },
    });

    console.log("razorpaye account inked : ", razorpayAccount);

    // 🧾 Save to DB
    const account = new Account({
      userId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      upiId,
      razorpayAccountId: razorpayAccount.id, // 👈 store sub-account ID here
    });

    await account.save();

    res.status(201).json({
      success: true,
      message:
        "Account details created and Razorpay account linked successfully.",
      data: account,
    });
  } catch (error) {
    console.error("Error in createAccountDetails:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// 📌 Update Account Details
exports.updateAccountDetails = async (req, res) => {
  try {
    const user = req.user.userId;
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } =
      req.body;

    // Validation: Required fields
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({
        success: false,
        message: "All fields except UPI ID are required.",
      });
    }

    let account = await Account.findOne({ userId: user });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "No account details found. Please create first.",
      });
    }

    // Update existing account details
    account.accountHolderName = accountHolderName;
    account.accountNumber = accountNumber;
    account.ifscCode = ifscCode;
    account.bankName = bankName;
    account.upiId = upiId || account.upiId;

    await account.save();

    res.status(200).json({
      success: true,
      message: "Account details updated successfully.",
      data: account,
    });
  } catch (error) {
    console.error("Error in updateAccountDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// 📌 Get Account Details
exports.getAccountDetails = async (req, res) => {
  try {
    const user = req.user.userId;
    const account = await Account.findOne({ userId: user });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "No account details found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account details fetched successfully.",
      data: account,
    });
  } catch (error) {
    console.error("Error in getAccountDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// 📌 Delete Account Details
exports.deleteAccountDetails = async (req, res) => {
  try {
    const user = req.user.userId;
    const account = await Account.findOneAndDelete({ userId: user });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "No account details found to delete.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account details deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteAccountDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};
