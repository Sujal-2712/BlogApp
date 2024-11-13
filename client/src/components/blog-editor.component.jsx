import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "./../imgs/logo.png";
import defaultBanner from "./../imgs/blog banner.png";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios"
import { API_URL } from './../../config';
const BlogEditor = () => {
    let { blog, blog: { title, banner, content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);
    const { blog_id } = useParams();
    const navigate = useNavigate();
    let { userAuth: { access_token } } = useContext(UserContext);

    const handleBannerUpload = async (e) => {
        let img = e.target.files[0];
        if (img) {
            const formData = new FormData();
            formData.append("banner", img);

            try {
                const response = await fetch(`${API_URL}/upload`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setBlog({ ...blog, banner: data.imageUrl });
                    toast.success("Image uploaded successfully!");
                } else {
                    toast.error("Failed to upload image");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Image upload failed");
            }
        }
    };


    useEffect(() => {
        setTextEditor(new EditorJS({
            holderId: "textEditor",
            data: Array.isArray(content) ? content[0] : "",
            placeholder: "Let's write a story!!"
        }));
    }, []);



    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = "auto";
        setBlog({ ...blog, title: input.value });
    };

    const handlePublish = async () => {
        if (!banner) {
            return toast.error("Image is required!!");
        }
        if (!title) {
            return toast.error("Blog Title is required!!");
        }

        if (textEditor.isReady) {
            try {
                const data = await textEditor.save();
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState("publish");
                } else {
                    return toast.error("Write something to publish the blog!!");
                }
            } catch (error) {
                console.log(error);
                toast.error("Error publishing blog");
            }
        }
    };

    const handleDraft = async (e) => {
        if (!title.length) {
            return toast.error("Title is required!!");
        }
        let loadingToast = toast.loading("Saving Draft...");
        try {
            const result = await axios.post(`${API_URL}/create-blog`,
                { title, banner, content, tags, des, draft: true, id: blog_id },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );
            toast.success("Saved Successfully!");

            setTimeout(() => [
                navigate("/dashboard/blogs")
            ], 500);
        } catch (error) {
            console.log(error);
            toast.error("Error Occurred!");
        } finally {
            toast.dismiss(loadingToast);
        }
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/">
                    <img src={logo} alt="" className="flex-none w-10" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title.length ? title : "New Blog"}
                </p>
                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" onClick={handlePublish}>Publish</button>
                    <button className="btn-light py-2" onClick={handleDraft}>Save Draft</button>
                </div>
            </nav>

            <section>
                <div className="mx-auto max-w-[650px] w-full">
                    <div className="relative aspect-video hover:opacity-80 border-4 border-grey">
                        <label htmlFor="uploadBanner">
                            {/* Use the uploaded banner or default one */}
                            <img src={banner || defaultBanner} className="z-20" alt="Banner" />
                            <input
                                type="file"
                                id="uploadBanner"
                                accept=".png, .jpg, .jpeg"
                                hidden
                                onChange={handleBannerUpload}
                                required
                            />
                        </label>
                    </div>

                    <textarea
                        placeholder="Blog Title"
                        className="text-3xl font-medium w-full h-14 outline-none resize-none mt-10 leading-right placeholder:opacity-40"
                        onChange={handleTitleChange}
                        required
                        value={title}
                    ></textarea>

                    <hr className="w-full opacity-50 my-5" />

                    <div id="textEditor" className="font-gelasio"></div>
                </div>
            </section>
        </>
    );
};

export default BlogEditor;
