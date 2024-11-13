import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";
import { API_URL } from "../../config";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: {
    personal_info: {},
  },
};

export const EditorContext = createContext({});

const Editor = () => {
  const { blog_id } = useParams();
  const [editorState, setEditorState] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(blogStructure);
  const [textEditor, setTextEditor] = useState({
    isReady: false
  })
  let { userAuth: { access_token } } = useContext(UserContext);

  const fetchBlog = async () => {
    try {
      const result = await axios.post(`${API_URL}/get-blog`, {
        blog_id, draft: true, mode: "edit"
      })
      setBlog(result.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!blog_id) {
      setLoading(false);
      return;
    }
    fetchBlog();
  }, []);

  return (
    <EditorContext.Provider value={{ editorState, setEditorState, blog, setBlog, textEditor, setTextEditor }}>
      {access_token === null ? <Navigate to="/signin" /> :
        loading ? <Loader /> :
          editorState == "editor" ? <BlogEditor /> : <PublishForm />}
    </EditorContext.Provider>
  );
};

export default Editor;
