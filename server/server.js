require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const path = require("path");
const { ConnectMongoDb } = require("./connection/conn");
const { auth } = require("./middleware/auth");
const multer = require("multer");
const { User } = require("./Schema/User");
const uniqid = require("uniqid");
const Blog = require("./Schema/Blog");
const Notification = require("./Schema/Notification");
const Comment = require("./Schema/Comment");
const { title } = require("process");
const app = express();
app.get("/", (req, res) => {
  res.json({ msg: "Sujal" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

ConnectMongoDb(process.env.DATABASE_URL)
  .then((result) => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const formatedDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

app.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashed) => {
    if (err) throw err;
    let username = email.split("@")[0];
    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed,
        username,
      },
    });

    user
      .save()
      .then((msg) => {
        return res.status(201).json({ user: formatedDataToSend(user) });
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "User Already Exists" });
        }
        return res.status(500).json({ error: "Something went wrong!!" });
      });
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(404).json({ error: "Email Not Found" }); // 404 for "Not Found"
    }
    const result = await bcrypt.compare(password, user.personal_info.password);
    if (!result) {
      return res.status(401).json({ error: "Incorrect Username or Password" }); // 401 for unauthorized access
    }
    return res.status(200).json(formatedDataToSend(user));
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error occurred, Please Try Again" });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ "personal_info.email": email });
  if (!user) return res.status(404).json({ error: "User not found" });
  const otp = Math.floor(100000 + Math.random() * 900000);
  user.reset_password_otp = otp;
  user.reset_password_otp_expires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  console.log(user);

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    to: user.personal_info.email, // Use the correct path to the email
    from: process.env.EMAIL,
    subject: "Password Reset OTP",
    text: `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
  res.status(200).json({ message: "OTP sent to your email" });
});

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Find user by email
  const user = await User.findOne({ "personal_info.email":email });
  console.log(user);
  if (!user || user.reset_password_otp !== parseInt(otp)) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Check if OTP is expired
  if (Date.now() > user.reset_password_otp_expires) {
    return res.status(400).json({ error: "OTP expired" });
  }

  // Update password and clear OTP fields
  user.password = await bcrypt.hash(newPassword, 10);
  user.reset_password_otp = undefined;
  user.reset_password_otp_expires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been reset successfully" });
});

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("banner"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, imageUrl });
});

app.post("/uploadProfile", auth, upload.single("banner"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
  const result = await User.findOneAndUpdate(
    { _id: req.user },
    {
      "personal_info.profile_img": imageUrl,
    }
  );
  res.status(200).json({ success: true, imageUrl });
});

app.post("/create-blog", auth, async (req, res) => {
  try {
    const authorId = req.user;
    let { title, des, banner, tags, content, draft, id } = req.body;
    console.log(req.body);

    if (!title.length) {
      return res
        .status(403)
        .json({ error: "You must provide a title to publish the blog!" });
    }

    tags = tags.map((tag) => tag.toLowerCase());

    const blogId = id
      ? id
      : title
          .replace(/[^a-zA-Z0-9]/g, " ")
          .replace(/\s+/g, "-")
          .trim() + uniqid();

    if (id) {
      const result = await Blog.findOneAndUpdate(
        { blog_id: blogId },
        { title, des, banner, content, tags, draft: draft ? draft : false }
      );
      return res.status(200).json({ blogId });
    } else {
      const blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id: blogId,
        draft: Boolean(draft),
      });
      const savedBlog = await blog.save();
      let incrementVal = draft ? 0 : 1;
      const updatedUser = await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: {
            blogs: savedBlog._id,
          },
        },
        { new: true }
      );
      return res.status(201).json({ id: savedBlog.blog_id });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/latest-blogs", async (req, res) => {
  let { page } = req.body;
  const maxLimit = 5;
  try {
    const result = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(err.message);
  }
});

app.post("/all-latest-blogs-count", async (req, res) => {
  try {
    const result = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: result });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/search-users", async (req, res) => {
  let { query } = req.body;
  try {
    const result = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .limit(10)
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      );
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/search-blogs", async (req, res) => {
  const { tag, page = 1, query, author, limit = 2, eliminate_blog } = req.body;

  let findQuery = { draft: false };

  if (tag) {
    findQuery.tags = tag;
    if (eliminate_blog) {
      findQuery.blog_id = { $ne: eliminate_blog };
    }
  } else if (query) {
    findQuery.title = new RegExp(query, "i");
  } else if (author) {
    findQuery.author = author;
  }

  const pageNumber = Math.max(1, parseInt(page, 10));

  try {
    const result = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    return res.json(result);
  } catch (error) {
    console.error("Error fetching blogs:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/search-blogs-count", async (req, res) => {
  let { tag, query, author } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { title: new RegExp(query, "i"), draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  try {
    const result = await Blog.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: result });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.get("/trending-blogs", async (req, res) => {
  try {
    const result = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/get-profile", async (req, res) => {
  let { username } = req.body;
  try {
    const result = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updateAt -blogs");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/get-blog", async (req, res) => {
  try {
    const { blog_id, mode } = req.body;
    let incrementVal = mode != "edit" ? 1 : 0;

    const result = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementVal } }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select("title des content banner activity publishedAt blog_id tags");

    await User.findOneAndUpdate(
      { "personal_info.username": result.author.personal_info.username },
      {
        $inc: { "account_info.total_reads": incrementVal },
      }
    ).catch((error) => {
      return res.status(500).json(error.message);
    });

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/like-blog", auth, async (req, res) => {
  const user_id = req.user;
  const { _id, isLikedbyUser } = req.body;
  const incrementVal = !isLikedbyUser ? 1 : -1;
  try {
    await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementVal } }
    ).then((blog) => {
      try {
        if (!isLikedbyUser) {
          let like = new Notification({
            type: "like",
            blog: _id,
            notification_for: blog.author,
            user: user_id,
          });
          like.save().then((notification) => {
            return res.status(200).json({ liked_by_user: true });
          });
        } else {
          Notification.findOneAndDelete({
            user: user_id,
            blog: _id,
            type: "like",
          })
            .then((data) => {
              return res.status(200).json({ liked_by_user: false });
            })
            .catch((err) => {
              return res.status(500).json(err.message);
            });
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/isliked-by-user", auth, async (req, res) => {
  const user_id = req.user;
  const { _id } = req.body;
  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json(err.message);
    });
});

app.post("/add-comment", auth, async (req, res) => {
  const user_id = req.user;
  const { _id, comment, blog_author, replying_to, notification_id } = req.body;
  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "Write something to leave a comment" });
  }
  const commentsObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentsObj.parent = replying_to;
    commentsObj.isReply = true;
  }

  new Comment(commentsObj).save().then(async (data) => {
    const { comment, commentedAt, children } = data;

    const result = await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: data._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    );

    const notificationObj = new Notification({
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: data._id,
    });
    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;
      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: data._id } }
      ).then((replyingToCommentDoc) => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by;
      });

      if (notification_id) {
        Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: data._id }
        ).then(() => {
          console.log("");
        });
      }
    }

    notificationObj.save().then((data) => {});

    return res.status(201).json({
      comment,
      commentedAt,
      _id: data._id,
      user_id,
      children,
    });
  });
});

app.post("/get-blog-comments", async (req, res) => {
  const { blog_id, skip } = req.body;
  const maxLimit = 5;
  try {
    const result = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedBy: -1 });

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

app.post("/get-replies", async (req, res) => {
  const { _id, skip } = req.body;

  let maxLimit = 5;
  try {
    const result = await Comment.findOne({ _id })
      .populate({
        path: "children",
        option: {
          limit: maxLimit,
          skip: skip,
          sort: {
            commentedAt: -1,
          },
        },
        populate: {
          path: "commented_by",
          select:
            "personal_info.profile_img personal_info.fullname personal_info.username",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children");

    return res.status(200).json({ replies: result.children });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

const deleteComment = async (_id) => {
  try {
    Comment.findOneAndDelete({ _id })
      .then(async (comment) => {
        if (!comment) {
          console.log("Comment not found");
          return;
        }
        // If the comment has a parent, remove it from the parent's children
        if (comment.parent) {
          await Comment.findOneAndUpdate(
            { _id: comment.parent },
            { $pull: { children: _id } }
          );
          console.log("Parent comment updated to remove deleted comment");
        }

        // Delete notifications related to the comment
        await Notification.findOneAndDelete({ comment: _id });
        await Notification.findOneAndUpdate(
          { reply: _id },
          { $unset: { reply: 1 } }
        );
        2222;
        // Update the blog by removing the comment
        await Blog.findOneAndUpdate(
          { _id: comment.blog_id },
          {
            $pull: { comments: _id },
            $inc: {
              "activity.total_comments": -1,
              "activity.total_parent_comments": comment.parent ? 0 : -1,
            },
          }
        );

        // Recursively delete child comments
        if (comment.children.length) {
          await Promise.all(
            comment.children.map((childId) => deleteComment(childId))
          );
        }
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
};

app.post("/delete-comment", auth, async (req, res) => {
  console.log("sujal");
  const user_id = req.user;
  const { _id } = req.body;
  console.log(req.body);
  try {
    const result = await Comment.findOne({ _id });
    console.log(result);
    if (!result) {
      return res.status(404).json({ status: "Comment not found" });
    }

    // Check if the user is authorized to delete the comment
    if (user_id == result.commented_by || user_id == result.blog_author) {
      const result = await deleteComment(_id);
      return res.status(200).json({ status: "done" });
    } else {
      return res.status(403).json({ status: "Not authorized" });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await User.findOne({ _id: req.user });
    if (!result) {
      return res.status(404).json({ error: "User not found!!" });
    }
    const isValid = await bcrypt.compare(
      currentPassword,
      result.personal_info.password
    );
    if (!isValid) {
      return res.status(405).json({ error: "Incorrect Password" });
    }

    bcrypt.hash(newPassword, 10, (err, hashed_password) => {
      User.findOneAndUpdate(
        { _id: req.user },
        { "personal_info.password": hashed_password }
      )
        .then((u) => {
          return res.status(200).json({ status: "Password Changed" });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/update-profile", auth, async (req, res) => {
  const { username, bio, social_links } = req.body;

  try {
    const socialLinksArr = Object.keys(social_links);
    for (const link of socialLinksArr) {
      const url = social_links[link];
      if (url && url.length > 0) {
        // Check if the URL starts with http:// or https://
        if (!/^https?:\/\//i.test(url)) {
          return res.status(403).json({
            error: `${link} link must start with 'http://' or 'https://'`,
          });
        }

        try {
          const hostname = new URL(url).hostname;
          if (!hostname.includes(`${link}.com`) && link !== "website") {
            return res.status(403).json({
              error: `${link} link is invalid. Please provide a valid link.`,
            });
          }
        } catch (urlError) {
          return res.status(403).json({
            error: `Invalid URL format for ${link}. Please provide a valid link.`,
          });
        }
      }
    }

    const updateObj = {
      "personal_info.username": username,
      "personal_info.bio": bio,
      social_links,
    };

    const result = await User.findOneAndUpdate({ _id: req.user }, updateObj, {
      new: true,
    });
    return res.status(200).json({ username: result.personal_info.username });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(500).json({ error: "Username not available" });
    }
    return res.status(500).json({ error: error.message });
  }
});

app.get("/new-notification", auth, async (req, res) => {
  let user_id = req.user;
  try {
    const result = await Notification.exists({
      notification_for: user_id,
      seen: false,
      user: { $ne: user_id },
    });
    if (result) {
      return res.status(200).json({ new_notification_available: true });
    } else {
      return res.status(200).json({ new_notification_available: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/notifications", auth, async (req, res) => {
  let user_id = req.user;
  let { page, filter, deleteDocCount } = req.body;
  let maxLimit = 10;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  let skipDocs = (page - 1) * maxLimit;
  if (filter != "all") {
    findQuery.type = filter;
  }
  if (deleteDocCount) {
    skipDocs -= deleteDocCount;
  }

  try {
    const result = await Notification.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate("blog", "title blog_id")
      .populate(
        "user",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .populate("comment", "comment")
      .populate("replied_on_comment", "comment")
      .populate("reply", "comment")
      .sort({ createdAt: -1 })
      .select("createdAt type seen");

    if (result) {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then((res) => {
          console.log("");
        });
      return res.status(200).json({ notifications: result });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/all-notifications-count", auth, async (req, res) => {
  let user_id = req.user;
  let { filter } = req.body;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  if (filter != "all") {
    findQuery.type = filter;
  }
  try {
    const result = await Notification.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/user-written-blogs", auth, async (req, res) => {
  const user_id = req.user;
  const { page, draft, query, deleteDocCount } = req.body;
  const maxLimit = 5;
  const skipDocs = (page - 1) * maxLimit;
  if (deleteDocCount) {
    skipDocs -= deleteDocCount;
  }
  try {
    const result = await Blog.find({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    })
      .skip(skipDocs)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .select("title banner publishedAt blog_id activity des draft -_id");
    return res.status(200).json({ blogs: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/user-written-blogs-count", auth, async (req, res) => {
  const user_id = req.user;
  const { draft, query } = req.body;
  try {
    const result = await Blog.countDocuments({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    });
    return res.status(200).json({ totalDocs: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/delete-blog", auth, async (req, res) => {
  const user_id = req.user;
  const { blog_id } = req.body;
  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) =>
        console.log("")
      );

      Comment.deleteMany({ blog_id: blog._id }).then((data) => console.log(""));

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id } },
        { $inc: { "account_info.total_posts": -1 } }
      ).then((data) => console.log(""));

      return res.status(200).json({ status: "done" });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
