const neo4jCalls = require("./post.services");
const router = require("express").Router();
const { protect } = require("../../middlewares/authMiddleware");

let string;

router.get("/", protect, async (req, res) => {
  let posts;

  try {
    posts = await neo4jCalls.getAllPosts();
  } catch (err) {
    console.log(err);
  }

  for (let i = 0; i < posts.records.length; i++) {
    posts.records[i] = posts.records[i]._fields;
  }

  // res.render("home", { posts: posts });
  res.json({ posts: posts.records });
});

// router.get("/createPost", protect, (req, res) => {
//   res.render("createPost");
// });

router.post("/createPost", protect, async (req, res) => {
  let { subject, text } = req.body;
  let email = res.user.email;
  if (!subject || !text) {
    console.log(`Field must not be empety`);
    res.json({
      success: 0,
      message: "Post could not be created",
    });
  } else {
    try {
      string = await neo4jCalls.createPost(email, subject, text);
      if (string) {
        res.json({
          success: 1,
          message: "Post created successufly",
        });
      } else {
        res.json({
          success: 0,
          message: "Post could not be created",
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
});

// router.get("/deletePost/:id", async (req, res) => {
//   let temp = req.params;
//   res.render("deletePost", { id: temp.id });
// });

router.delete("/deletePost/:id", protect, async (req, res) => {
  console.log(`We are here`);
  let Id = req.params.id;
  console.log(`User ${Id}`);

  let userEmail = await neo4jCalls.getPost(Id);
  userEmail = userEmail.records[0]._fields[0].emailUser;
  if (userEmail !== res.user.email) {
    res.json({
      success: 0,
      message: "You can not delete this post it is not yours ",
    });
  } else {
    try {
      let t = await neo4jCalls.deletePost(Id);
      if (t) {
        res.json({
          success: 1,
          message: "Post deleted successfuly",
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  //res.redirect("/posts");
});

router.get("/:id", protect, async (req, res) => {
  let temp = req.params.id;
  console.log(`Id is ${temp}`);
  let e = await neo4jCalls.getPost(temp);
  // console.log(e.records[0]._fields[0]);
  if (e) {
    res.json({
      success: 1,
      message: "Got it successufuly",
      data: e.records[0]._fields[0],
    });
  }

  //res.render("getPost", { e });
});

// router.get("/updatePost/:id", async (req, res) => {
//   let id = req.params.id;
//   let e = await neo4jCalls.getPost(id);
//   res.render("updatePost", { id, e });
// });

router.put("/updatePost/:id", protect, async (req, res) => {
  let id = req.params.id;
  let { subject, post } = req.body;

  let userPost = await neo4jCalls.getPost(id);
  userEmail = userPost.records[0]._fields[0].emailUser;
  if (userEmail !== res.user.email) {
    res.json({
      success: 0,
      message: "You can not update this post it is not yours ",
    });
  } else {
    if (!post) {
      post = userPost.records[0]._fields[0].text;
    } else if (!subject) {
      subject = userPost.records[0]._fields[0].subject;
    }
    const result = await neo4jCalls.updatePost(id, subject, post);

    if (result) {
      res.json({
        success: 1,
        message: "Post updated successfuly",
      });
    }
  }

  //res.redirect("/posts");
});

[[], 0];

router.post("/:id", protect, async (req, res) => {
  let id = req.params.id;
  let likes = await neo4jCalls.getLikesOfPost(id);
  let post = await neo4jCalls.getPost(id);
  let L = likes.records[0]._fields[0];
  let numbL = post.records[0]._fields[0].likes;
  let k;
  if (L.users.includes(res.user.email)) {
    console.log("True");
    let e = res.user.email;
    k = L.users;
    k = k.replace(`,${res.user.email}`, "");
    numbL = parseInt(numbL) - 1;
  } else {
    k = L.users.concat(`,${res.user.email}`);
    numbL = parseInt(numbL) + 1;
    console.log(k);
  }

  const result = await neo4jCalls.likePost(id, numbL, k);

  if (result) {
    res.json({
      success: 1,
      message: "Liked Post succussefuly",
      data: result.records[0]._fields,
    });
  }

  // let userPost = await neo4jCalls.getPost(id);
  // L = userPost.records[0]._fields[0].likes;
  // console.log("L  " + L);
  // if (L != 0) {
  //   likes = L;
  //   likes[0].push({ userEmail: res.user.email });
  //   likes[1] = parseInt(likes[1]) + 1;
  // } else {
  //   likes.push([{ userEmail:`${res.user.email}` }]);
  //   likes.push(1);
  // }
  // console.log("Likes " + likes);
  // const result = await neo4jCalls.likePost(id, likes);
  // if (result) {
  //   res.json({
  //     success: 1,
  //     message: "Liked Post succussefuly",
  //   });
  // }
});

module.exports = router;
