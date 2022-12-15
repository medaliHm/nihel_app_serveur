module.exports = function ({ app, dbConn, upload }) {
  app.post('/posts', upload.array('images'), (req, res) => {
    const files = req.files;

    if (!files) {
      console.log("Files Empty")
      res.status(200).jsonp({
        message: "Please upload your post image",
      });
    } else {


      const postCategory = req.body.category
      const addresse = req.body.addresse
      const rating = req.body.rating

      const nom = req.body.nom
      const avis = req.body.avis

      console.log(nom)
      const postCreatedDate = new Date();
      const postCreatedBy = req.body.post_created_by;
      if (postCreatedBy) {
        console.log(postCategory)
        const createdPost = [[postCategory, nom, addresse, rating, avis, postCreatedDate, postCreatedBy]];
        const createPostSql = "INSERT INTO post ( post_category,nom,addresse,rating,avis, post_created_date, post_created_by) VALUES ?";
        dbConn.query(createPostSql, [createdPost], function (error, insertedPost) {
          if (insertedPost) {
            for (let i = 0; i < files.length; i++) {
              const postContent = `${files[i].filename}`;
              const ImagePost = [[postContent, insertedPost.insertId]];
              const createPostImageSql = "INSERT INTO post_image (image, post_id) VALUES ?";

              dbConn.query(createPostImageSql, [ImagePost], function (error, insertedImage) {
                console.log("inserted");
              });

            }
            res.status(200).jsonp({ id: insertedPost.insertId, post_category: postCategory, post_created_date: postCreatedDate, post_created_by: postCreatedBy });


          } else {
            console.log(error)
            console.log("Error ")
            res.status(200).jsonp({ message: 'Cannot upload your post, please try again' });
          }
        });
      } else {
        res.status(200).jsonp({ message: 'Cannot upload your post, please try again' });
      }
    }
  });

  app.get('/posts', (req, res) => {
    let results = new Array();

    const getPostsSql = "SELECT post.id, post_category,rating,addresse,avis,nom ,post_created_date, post_created_by, post_number_of_reactions, user_account.user_avatar, user_account.user_full_name, user_account.user_number_of_followers FROM post INNER JOIN user_account ON post.post_created_by = user_account.id  ORDER BY post.post_created_date DESC";
    dbConn.query(getPostsSql, function (error, posts) {

      if (posts) {


        res.status(200).jsonp(posts);
      } else {
        res.status(200).jsonp({ message: 'Cannot get your posts, please try again' });
      }
    });
  });

  app.get('/post/image/:id', (req, res) => {
    const id = req.params.id;

    const getPostsImagesSql = "SELECT image FROM post_image where post_id=" + id + "";
    dbConn.query(getPostsImagesSql, function (error, pictures) {
      if (pictures) {
        console.log(pictures)
        res.status(200).jsonp(pictures);

      } else {
        console.log(error)
      }

    });



  });


  app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    const getPostSql = "SELECT post.id, post_category,rating,addresse,avis,nom, post_created_date, post_created_by, post_number_of_reactions, user_account.user_avatar, user_account.user_full_name, user_account.user_number_of_followers FROM post INNER JOIN user_account ON post.post_created_by = user_account.id WHERE post.id = ?";
    if (!id) {
      res.status(200).jsonp({ message: 'Cannot load the post detail, please try again' });
    }
    dbConn.query(getPostSql, [id], function (error, response) {
      if (response && response.length) {
        res.status(200).jsonp(response);
      } else {
        res.status(200).jsonp({ message: 'Not found' });
      }
    });
  });

  app.post('/posts/reactions', (req, res) => {
    const { numberOfReactions, id } = req.body;
    const updateNumberOfReactionsSql = "UPDATE post SET post_number_of_reactions = ? WHERE id = ?";
    dbConn.query(updateNumberOfReactionsSql, [numberOfReactions, id], function (err, updatedPost) {
      if (err) {
        res.status(200).jsonp({ message: "The system error. Please try again" });
      } else if (updatedPost) {
        res.status(200).jsonp({ id });
      }
    });
  });

  app.post('/posts/user', (req, res) => {
    const { userId } = req.body;
    if (!userId ) {
      res.status(200).jsonp({ message: 'Cannot load your posts, please try again' });
    }
    console.log(userId)
    const getPostsSql = "SELECT * FROM post WHERE post_created_by = ?  ORDER BY post_created_date DESC";
    dbConn.query(getPostsSql, [userId], function (error, posts) {
      if (posts) {
                console.log(posts)

        res.status(200).jsonp(posts);
      } else {
        res.status(200).jsonp({ message: 'Cannot get your posts, please try again' });
      }
    });
  });
}