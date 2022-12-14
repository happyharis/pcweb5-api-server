import express from "express";
import mysql from "mysql2";

const pool = mysql
  .createPool({
    host: "remotemysql.com",
    user: "f1AVcIJXIC",
    password: "Cj6y9JFw0I",
    database: "f1AVcIJXIC",
  })
  .promise();

const app = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function getPosts() {
  const [rows] = await pool.query("SELECT * FROM posts;");
  return rows;
}

async function getPost(id) {
  const [rows] = await pool.query(
    `select *
        from posts
        where id = ?
        `,
    [id]
  );
  return rows[0];
}

async function addPost(caption, image) {
  const [result] = await pool.query(
    `INSERT INTO posts (caption, image)
        VALUES (?, ?)
        `,
    [caption, image]
  );
  const id = result.insertId;
  return getPost(id);
}
async function updatePost(id, caption, image) {
  await pool.query(
    `
    UPDATE  posts 
    set caption = ?, image = ? 
    where id = ?;
    `,
    [caption, image, id]
  );
  return getPost(id);
}

async function deleteNote(id) {
  await pool.query(`DELETE FROM posts where id = ?`, [id]);
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", async (req, res) => {
  const posts = await getPosts();
  res.send(posts).status(202);
});

app.get("/post/:id", async (req, res) => {
  const id = req.params.id;
  const post = await getPost(id);
  res.send(post).status(202);
});

app.put("/post/:id", async (req, res) => {
  const id = req.params.id;
  const { caption, image } = req.body;
  const updatedPost = await updatePost(id, caption, image);
  res.send(updatedPost).status(202);
});

app.post("/add", async (req, res) => {
  const { caption, image } = req.body;
  const post = await addPost(caption, image);
  console.log("Post added: ", post);
  res.send({ status: "success" }).status(202);
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await deleteNote(id);
  res.send({ status: "success" }).status(202);
});
